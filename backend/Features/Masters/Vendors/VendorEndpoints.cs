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

        var (ledger, referenceError) = await PopulateVendorReferencesAsync(request.LedgerId, buildResult.CreditAndFinance, dbContext, cancellationToken);
        if (referenceError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, referenceError, null));
        }

        var now = DateTime.UtcNow;
        var vendor = new Vendor
        {
            BasicInfo = buildResult.BasicInfo,
            AddressAndContact = buildResult.AddressAndContact,
            CreditAndFinance = buildResult.CreditAndFinance,
            TaxAndCompliance = NormalizeTaxAndCompliance(request.TaxAndCompliance),
            LedgerId = ledger?.Id,
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

        dbContext.Vendors.Add(vendor);
        await dbContext.SaveChangesAsync(cancellationToken);

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

        var (ledger, referenceError) = await PopulateVendorReferencesAsync(request.LedgerId, buildResult.CreditAndFinance, dbContext, cancellationToken);
        if (referenceError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, referenceError, null));
        }

        vendor.BasicInfo = buildResult.BasicInfo;
        vendor.AddressAndContact = buildResult.AddressAndContact;
        vendor.CreditAndFinance = buildResult.CreditAndFinance;
        vendor.TaxAndCompliance = NormalizeTaxAndCompliance(request.TaxAndCompliance);
        vendor.LedgerId = ledger?.Id;
        vendor.Ledger = ledger;
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

    private static async Task<(Ledger? Ledger, string? Error)> PopulateVendorReferencesAsync(
        Guid? ledgerId,
        VendorCreditAndFinance creditAndFinance,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var ledger = await ResolveLedgerAsync(ledgerId, dbContext, cancellationToken);
        if (ledgerId is not null && ledger is null)
        {
            return (null, "Selected ledger does not exist.");
        }

        if (ledger is not null && ledger.Status != LedgerStatuses.Active)
        {
            return (null, "Selected ledger must be active.");
        }

        var currency = await ResolveCurrencyAsync(creditAndFinance.CurrencyId, dbContext, cancellationToken);
        if (creditAndFinance.CurrencyId is not null && currency is null)
        {
            return (null, "Selected currency does not exist.");
        }

        creditAndFinance.Currency = currency;
        return (ledger, null);
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

    private static async Task<Ledger?> ResolveLedgerAsync(
        Guid? ledgerId,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (ledgerId is null)
        {
            return null;
        }

        return await dbContext.Ledgers.FirstOrDefaultAsync(current => current.Id == ledgerId.Value, cancellationToken);
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
}
