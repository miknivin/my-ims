using backend.Features.Masters.Currencies;
using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Filtering;
using backend.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Vendors;

public static class VendorEndpoints
{
    public static IEndpointRouteBuilder MapVendorEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/vendors").WithTags("Vendor Masters");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPut("/{id:guid}", UpdateAsync);
        group.MapDelete("/{id:guid}", DeleteAsync);

        return app;
    }

    private static async Task<IResult> GetAllAsync(
        [AsParameters] VendorFilterRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var handler = new GetVendorsQueryHandler(dbContext, new VendorSortRegistry());
        var vendors = await handler.HandleAsync(request, cancellationToken);

        return TypedResults.Ok(new ApiResponse<PagedResponse<VendorListItemDto>>(
            true,
            "Vendor list fetched successfully.",
            vendors));
    }

    private static async Task<IResult> GetByIdAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var vendor = await dbContext.Vendors
            .Include(current => current.Ledger)
                .ThenInclude(current => current!.LedgerGroup)
            .Include(current => current.OpeningBalance)
            .Include(current => current.CreditAndFinance.Currency)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return vendor is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Vendor not found.", null))
            : TypedResults.Ok(new ApiResponse<VendorDto>(
                true,
                "Vendor fetched successfully.",
                VendorDto.FromEntity(vendor)));
    }

    private static async Task<IResult> CreateAsync(
        CreateVendorRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildVendorRequest(
            request.BasicInfo,
            request.AddressAndContact,
            request.CreditAndFinance,
            request.Status,
            request.OpeningBalance);

        if (!buildResult.IsValid)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error!, null));
        }

        if (await dbContext.Vendors.AnyAsync(
                current => current.BasicInfo.Code == buildResult.BasicInfo.Code || current.BasicInfo.Name == buildResult.BasicInfo.Name,
                cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Vendor with this code or name already exists.", null));
        }

        var (ledgerGroup, currency, referenceError) = await PopulateVendorReferencesAsync(request.LedgerGroupId, buildResult.CreditAndFinance, dbContext, cancellationToken);
        if (referenceError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, referenceError, null));
        }

        var now = DateTime.UtcNow;
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var ledger = new Ledger
        {
            Code = buildResult.BasicInfo.Code,
            Name = buildResult.BasicInfo.Name,
            LedgerGroupId = ledgerGroup!.Id,
            LedgerGroup = ledgerGroup,
            DefaultCurrencyId = currency?.Id,
            DefaultCurrency = currency,
            Status = LedgerStatuses.Active,
            AllowManualPosting = true,
            IsBillWise = true,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        var ledgerConflict = await HasLedgerConflictAsync(ledger.Code, ledger.Name, null, dbContext, cancellationToken);
        if (ledgerConflict)
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "A ledger with this vendor code or name already exists.", null));
        }

        var vendor = new Vendor
        {
            BasicInfo = buildResult.BasicInfo,
            AddressAndContact = buildResult.AddressAndContact,
            CreditAndFinance = buildResult.CreditAndFinance,
            TaxAndCompliance = NormalizeTaxAndCompliance(request.TaxAndCompliance),
            LedgerId = ledger.Id,
            Ledger = ledger,
            BankDetails = NormalizeBankDetails(request.BankDetails),
            Other = NormalizeOther(request.Other),
            Status = buildResult.Status,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        if (buildResult.OpeningBalance is not null)
        {
            vendor.OpeningBalance = new VendorOpeningBalance
            {
                VendorId = vendor.Id,
                Amount = buildResult.OpeningBalance.Amount,
                BalanceType = buildResult.OpeningBalance.BalanceType,
                AsOfDate = buildResult.OpeningBalance.AsOfDate,
                CreatedAtUtc = now,
                UpdatedAtUtc = now
            };
        }

        dbContext.Ledgers.Add(ledger);
        dbContext.Vendors.Add(vendor);
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return TypedResults.Created($"/api/masters/vendors/{vendor.Id}", new ApiResponse<VendorDto>(
            true,
            "Vendor created successfully.",
            VendorDto.FromEntity(vendor)));
    }

    private static async Task<IResult> UpdateAsync(
        Guid id,
        UpdateVendorRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildVendorRequest(
            request.BasicInfo,
            request.AddressAndContact,
            request.CreditAndFinance,
            request.Status,
            request.OpeningBalance);

        if (!buildResult.IsValid)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error!, null));
        }

        var vendor = await dbContext.Vendors
            .Include(current => current.Ledger)
                .ThenInclude(current => current!.LedgerGroup)
            .Include(current => current.OpeningBalance)
            .Include(current => current.CreditAndFinance.Currency)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        if (vendor is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Vendor not found.", null));
        }

        if (await dbContext.Vendors.AnyAsync(
                current => current.Id != id && (current.BasicInfo.Code == buildResult.BasicInfo.Code || current.BasicInfo.Name == buildResult.BasicInfo.Name),
                cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Vendor with this code or name already exists.", null));
        }

        var (ledgerGroup, currency, referenceError) = await PopulateVendorReferencesAsync(request.LedgerGroupId, buildResult.CreditAndFinance, dbContext, cancellationToken);
        if (referenceError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, referenceError, null));
        }

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var currentLedger = vendor.Ledger;
        var requestedLedgerGroupId = ledgerGroup!.Id;
        var ledgerGroupChanged = currentLedger is not null && currentLedger.LedgerGroupId != requestedLedgerGroupId;

        if (ledgerGroupChanged)
        {
            var hasLedgerTransactions = await dbContext.JournalEntries.AnyAsync(
                current => current.LedgerId == currentLedger!.Id,
                cancellationToken);

            if (hasLedgerTransactions)
            {
                return TypedResults.BadRequest(new ApiResponse<object>(
                    false,
                    "Ledger group cannot be changed after transactions exist for this vendor ledger.",
                    null));
            }
        }

        var effectiveLedgerId = currentLedger?.Id;
        var ledgerConflict = await HasLedgerConflictAsync(
            buildResult.BasicInfo.Code,
            buildResult.BasicInfo.Name,
            effectiveLedgerId,
            dbContext,
            cancellationToken);

        if (ledgerConflict)
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "A ledger with this vendor code or name already exists.", null));
        }

        var ledgerNow = DateTime.UtcNow;
        if (currentLedger is null)
        {
            currentLedger = new Ledger
            {
                Code = buildResult.BasicInfo.Code,
                Name = buildResult.BasicInfo.Name,
                LedgerGroupId = requestedLedgerGroupId,
                LedgerGroup = ledgerGroup,
                DefaultCurrencyId = currency?.Id,
                DefaultCurrency = currency,
                Status = LedgerStatuses.Active,
                AllowManualPosting = true,
                IsBillWise = true,
                CreatedAtUtc = ledgerNow,
                UpdatedAtUtc = ledgerNow
            };

            dbContext.Ledgers.Add(currentLedger);
            vendor.LedgerId = currentLedger.Id;
            vendor.Ledger = currentLedger;
        }
        else
        {
            currentLedger.Code = buildResult.BasicInfo.Code;
            currentLedger.Name = buildResult.BasicInfo.Name;
            currentLedger.LedgerGroupId = requestedLedgerGroupId;
            currentLedger.LedgerGroup = ledgerGroup;
            currentLedger.DefaultCurrencyId = currency?.Id;
            currentLedger.DefaultCurrency = currency;
            currentLedger.Status = LedgerStatuses.Active;
            currentLedger.AllowManualPosting = true;
            currentLedger.IsBillWise = true;
            currentLedger.UpdatedAtUtc = ledgerNow;

            vendor.LedgerId = currentLedger.Id;
            vendor.Ledger = currentLedger;
        }

        vendor.BasicInfo = buildResult.BasicInfo;
        vendor.AddressAndContact = buildResult.AddressAndContact;
        vendor.CreditAndFinance = buildResult.CreditAndFinance;
        vendor.TaxAndCompliance = NormalizeTaxAndCompliance(request.TaxAndCompliance);
        vendor.BankDetails = NormalizeBankDetails(request.BankDetails);
        vendor.Other = NormalizeOther(request.Other);
        vendor.Status = buildResult.Status;
        vendor.UpdatedAtUtc = DateTime.UtcNow;

        if (buildResult.OpeningBalance is null)
        {
            if (vendor.OpeningBalance is not null)
            {
                dbContext.VendorOpeningBalances.Remove(vendor.OpeningBalance);
                vendor.OpeningBalance = null;
            }
        }
        else if (vendor.OpeningBalance is null)
        {
            var now = DateTime.UtcNow;
            vendor.OpeningBalance = new VendorOpeningBalance
            {
                VendorId = vendor.Id,
                Amount = buildResult.OpeningBalance.Amount,
                BalanceType = buildResult.OpeningBalance.BalanceType,
                AsOfDate = buildResult.OpeningBalance.AsOfDate,
                CreatedAtUtc = now,
                UpdatedAtUtc = now
            };
        }
        else
        {
            vendor.OpeningBalance.Amount = buildResult.OpeningBalance.Amount;
            vendor.OpeningBalance.BalanceType = buildResult.OpeningBalance.BalanceType;
            vendor.OpeningBalance.AsOfDate = buildResult.OpeningBalance.AsOfDate;
            vendor.OpeningBalance.UpdatedAtUtc = DateTime.UtcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<VendorDto>(
            true,
            "Vendor updated successfully.",
            VendorDto.FromEntity(vendor)));
    }

    private static async Task<IResult> DeleteAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var vendor = await dbContext.Vendors
            .Include(current => current.OpeningBalance)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        if (vendor is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Vendor not found.", null));
        }

        dbContext.Vendors.Remove(vendor);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Vendor deleted successfully.", null));
    }

    private static VendorRequestBuildResult BuildVendorRequest(
        VendorBasicInfoRequest basicInfoRequest,
        VendorAddressAndContactRequest addressAndContactRequest,
        VendorCreditAndFinanceRequest creditAndFinanceRequest,
        string? status,
        VendorOpeningBalanceRequest? openingBalanceRequest)
    {
        var basicInfo = new VendorBasicInfo
        {
            Code = basicInfoRequest.Code?.Trim().ToUpperInvariant() ?? string.Empty,
            Name = basicInfoRequest.Name?.Trim() ?? string.Empty,
            Under = NormalizeOptional(basicInfoRequest.Under)
        };

        var addressAndContact = new VendorAddressAndContact
        {
            ContactName = NormalizeOptional(addressAndContactRequest.ContactName),
            NameInOl = NormalizeOptional(addressAndContactRequest.NameInOl),
            Address = addressAndContactRequest.Address?.Trim() ?? string.Empty,
            Phone = addressAndContactRequest.Phone?.Trim() ?? string.Empty,
            Mobile = NormalizeOptional(addressAndContactRequest.Mobile),
            Email = addressAndContactRequest.Email?.Trim() ?? string.Empty,
            Web = NormalizeOptional(addressAndContactRequest.Web),
            Fax = NormalizeOptional(addressAndContactRequest.Fax)
        };

        var creditAndFinance = new VendorCreditAndFinance
        {
            CreditLimit = creditAndFinanceRequest.CreditLimit,
            DueDays = creditAndFinanceRequest.DueDays,
            CurrencyId = creditAndFinanceRequest.CurrencyId,
            PaymentTerms = NormalizeOptional(creditAndFinanceRequest.PaymentTerms),
            Remark = NormalizeOptional(creditAndFinanceRequest.Remark)
        };

        var normalizedStatus = string.IsNullOrWhiteSpace(status) ? VendorStatuses.Active : status.Trim();
        var openingBalance = openingBalanceRequest;

        if (string.IsNullOrWhiteSpace(basicInfo.Code))
        {
            return VendorRequestBuildResult.Invalid("Vendor code is required.");
        }

        if (basicInfo.Code.Length < 2)
        {
            return VendorRequestBuildResult.Invalid("Vendor code must be at least 2 characters.");
        }

        if (basicInfo.Code.Length > 20)
        {
            return VendorRequestBuildResult.Invalid("Vendor code cannot exceed 20 characters.");
        }

        if (string.IsNullOrWhiteSpace(basicInfo.Name))
        {
            return VendorRequestBuildResult.Invalid("Vendor name is required.");
        }

        if (basicInfo.Name.Length < 3)
        {
            return VendorRequestBuildResult.Invalid("Vendor name must be at least 3 characters.");
        }

        if (basicInfo.Name.Length > 120)
        {
            return VendorRequestBuildResult.Invalid("Vendor name cannot exceed 120 characters.");
        }

        if (string.IsNullOrWhiteSpace(addressAndContact.Address))
        {
            return VendorRequestBuildResult.Invalid("Address is required.");
        }

        if (addressAndContact.Address.Length > 250)
        {
            return VendorRequestBuildResult.Invalid("Address cannot exceed 250 characters.");
        }

        if (string.IsNullOrWhiteSpace(addressAndContact.Phone))
        {
            return VendorRequestBuildResult.Invalid("Phone is required.");
        }

        if (addressAndContact.Phone.Length > 30)
        {
            return VendorRequestBuildResult.Invalid("Phone cannot exceed 30 characters.");
        }

        if (string.IsNullOrWhiteSpace(addressAndContact.Email))
        {
            return VendorRequestBuildResult.Invalid("Email is required.");
        }

        if (addressAndContact.Email.Length > 120)
        {
            return VendorRequestBuildResult.Invalid("Email cannot exceed 120 characters.");
        }

        if (creditAndFinance.CreditLimit is < 0)
        {
            return VendorRequestBuildResult.Invalid("Credit limit cannot be negative.");
        }

        if (creditAndFinance.DueDays is < 0)
        {
            return VendorRequestBuildResult.Invalid("Due days cannot be negative.");
        }

        if (!VendorStatuses.All.Contains(normalizedStatus, StringComparer.OrdinalIgnoreCase))
        {
            return VendorRequestBuildResult.Invalid("Status must be either Active or Inactive.");
        }

        if (openingBalanceRequest is not null)
        {
            if (openingBalanceRequest.Amount < 0)
            {
                return VendorRequestBuildResult.Invalid("Opening balance amount cannot be negative.");
            }

            if (!BalanceTypes.All.Contains(openingBalanceRequest.BalanceType, StringComparer.OrdinalIgnoreCase))
            {
                return VendorRequestBuildResult.Invalid("Opening balance type must be either Dr or Cr.");
            }

            openingBalance = openingBalanceRequest with
            {
                BalanceType = BalanceTypes.All.First(value =>
                    value.Equals(openingBalanceRequest.BalanceType, StringComparison.OrdinalIgnoreCase))
            };
        }

        var requestedStatus = normalizedStatus;
        normalizedStatus = VendorStatuses.All.First(value => value.Equals(requestedStatus, StringComparison.OrdinalIgnoreCase));
        return VendorRequestBuildResult.Valid(
            basicInfo,
            addressAndContact,
            creditAndFinance,
            normalizedStatus,
            openingBalance);
    }

    private static async Task<(LedgerGroup? LedgerGroup, Currency? Currency, string? Error)> PopulateVendorReferencesAsync(
        Guid ledgerGroupId,
        VendorCreditAndFinance creditAndFinance,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (ledgerGroupId == Guid.Empty)
        {
            return (null, null, "Ledger group is required.");
        }

        var ledgerGroup = await ResolveLedgerGroupAsync(ledgerGroupId, dbContext, cancellationToken);
        if (ledgerGroup is null)
        {
            return (null, null, "Selected ledger group does not exist.");
        }

        if (ledgerGroup.Status != LedgerGroupStatuses.Active)
        {
            return (null, null, "Selected ledger group must be active.");
        }

        if (!string.Equals(ledgerGroup.Nature, LedgerGroupNatures.Liability, StringComparison.OrdinalIgnoreCase))
        {
            return (null, null, "Selected ledger group must be liability compatible for vendors.");
        }

        var currency = await ResolveCurrencyAsync(creditAndFinance.CurrencyId, dbContext, cancellationToken);
        if (creditAndFinance.CurrencyId is not null && currency is null)
        {
            return (null, null, "Selected currency does not exist.");
        }

        creditAndFinance.Currency = currency;
        return (ledgerGroup, currency, null);
    }

    private sealed record VendorRequestBuildResult(
        bool IsValid,
        string? Error,
        VendorBasicInfo BasicInfo,
        VendorAddressAndContact AddressAndContact,
        VendorCreditAndFinance CreditAndFinance,
        string Status,
        VendorOpeningBalanceRequest? OpeningBalance)
    {
        public static VendorRequestBuildResult Valid(
            VendorBasicInfo basicInfo,
            VendorAddressAndContact addressAndContact,
            VendorCreditAndFinance creditAndFinance,
            string status,
            VendorOpeningBalanceRequest? openingBalance) =>
            new(true, null, basicInfo, addressAndContact, creditAndFinance, status, openingBalance);

        public static VendorRequestBuildResult Invalid(string error) =>
            new(false, error, new VendorBasicInfo(), new VendorAddressAndContact(), new VendorCreditAndFinance(), string.Empty, null);
    }

    private static VendorTaxAndCompliance NormalizeTaxAndCompliance(VendorTaxAndComplianceRequest request)
    {
        return new VendorTaxAndCompliance
        {
            Gstin = NormalizeOptional(request.Gstin),
            Tin = NormalizeOptional(request.Tin)
        };
    }

    private static VendorBankDetails NormalizeBankDetails(VendorBankDetailsRequest request)
    {
        return new VendorBankDetails
        {
            BankDetails = NormalizeOptional(request.BankDetails),
            AccountNo = NormalizeOptional(request.AccountNo),
            BankAddress = NormalizeOptional(request.BankAddress)
        };
    }

    private static VendorOtherInfo NormalizeOther(VendorOtherInfoRequest request)
    {
        return new VendorOtherInfo
        {
            Company = NormalizeOptional(request.Company)
        };
    }

    private static async Task<LedgerGroup?> ResolveLedgerGroupAsync(
        Guid ledgerGroupId,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        return await dbContext.LedgerGroups.FirstOrDefaultAsync(current => current.Id == ledgerGroupId, cancellationToken);
    }

    private static async Task<Currency?> ResolveCurrencyAsync(
        Guid? currencyId,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (currencyId is null)
        {
            return null;
        }

        return await dbContext.Currencies.FirstOrDefaultAsync(current => current.Id == currencyId.Value, cancellationToken);
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static async Task<bool> HasLedgerConflictAsync(
        string code,
        string name,
        Guid? excludeLedgerId,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        return await dbContext.Ledgers.AnyAsync(
            current =>
                current.Id != excludeLedgerId &&
                (current.Code == code || current.Name == name),
            cancellationToken);
    }
}
