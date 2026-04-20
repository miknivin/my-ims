using backend.Features.Masters.Customers;
using backend.Features.Masters.Ledgers;
using backend.Features.Transactions.SalesInvoices;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Transactions.BillWiseReceipts;

public static class BillWiseReceiptEndpoints
{
    public static IEndpointRouteBuilder MapBillWiseReceiptEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/bill-wise-receipts").WithTags("Bill Wise Receipts");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/outstanding-invoices", GetOutstandingInvoicesAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPut("/{id:guid}", UpdateAsync);
        group.MapDelete("/{id:guid}", DeleteAsync);

        return app;
    }

    private static IQueryable<BillWiseReceipt> BuildQuery(AppDbContext dbContext)
    {
        return dbContext.Set<BillWiseReceipt>()
            .Include(current => current.CustomerInformation.Customer)
            .Include(current => current.AccountInformation.Ledger)
            .Include(current => current.Allocations)
                .ThenInclude(current => current.SalesInvoice);
    }

    private static async Task<IResult> GetAllAsync(AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var receipts = await dbContext.Set<BillWiseReceipt>()
            .AsNoTracking()
            .OrderByDescending(current => current.UpdatedAtUtc)
            .Select(current => new BillWiseReceiptListItemDto(
                current.Id,
                current.No,
                current.Date,
                current.CustomerInformation.CustomerNameSnapshot,
                current.Amount,
                current.TotalAllocated,
                current.TotalDiscount,
                current.Advance,
                ToStatusLabel(current.Status),
                current.CreatedAtUtc,
                current.UpdatedAtUtc))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<BillWiseReceiptListItemDto>>(
            true,
            "Bill wise receipt list fetched successfully.",
            receipts));
    }

    private static async Task<IResult> GetOutstandingInvoicesAsync(
        Guid customerId,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (customerId == Guid.Empty)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "Customer is required.", null));
        }

        var items = await dbContext.SalesInvoices
            .AsNoTracking()
            .Where(current =>
                current.CustomerInformation.CustomerId == customerId &&
                current.Status != SalesInvoiceStatus.Cancelled &&
                current.FinancialDetails.Balance > 0)
            .OrderBy(current => current.Document.Date)
            .ThenBy(current => current.Document.No)
            .Select(current => new BillWiseReceiptOutstandingInvoiceDto(
                current.Id,
                current.Document.No,
                current.Document.Date,
                current.Document.DueDate,
                current.SourceRef.ReferenceNo,
                current.General.Notes,
                current.Footer.NetTotal,
                current.FinancialDetails.Balance))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<BillWiseReceiptOutstandingInvoiceDto>>(
            true,
            "Outstanding sales invoices fetched successfully.",
            items));
    }

    private static async Task<IResult> GetByIdAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var receipt = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return receipt is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Bill wise receipt not found.", null))
            : TypedResults.Ok(new ApiResponse<BillWiseReceiptDto>(
                true,
                "Bill wise receipt fetched successfully.",
                BillWiseReceiptDto.FromEntity(receipt)));
    }

    private static async Task<IResult> CreateAsync(
        CreateBillWiseReceiptRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildBillWiseReceiptRequest(
            request.Document,
            request.CustomerInformation,
            request.AccountInformation,
            request.ReceiptDetails,
            request.Allocations,
            request.Status,
            BillWiseDocumentStatus.Submitted);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.Set<BillWiseReceipt>().AnyAsync(current => current.No == buildResult.Receipt.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Bill wise receipt number already exists.", null));
        }

        var resolutionError = await ResolveReferencesAsync(
            dbContext,
            buildResult.Receipt,
            new Dictionary<Guid, decimal>(),
            cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        var now = DateTime.UtcNow;
        buildResult.Receipt.CreatedAtUtc = now;
        buildResult.Receipt.UpdatedAtUtc = now;

        if (buildResult.Receipt.Status == BillWiseDocumentStatus.Submitted)
        {
            ApplySettlements(buildResult.Receipt.Allocations);
        }

        dbContext.Set<BillWiseReceipt>().Add(buildResult.Receipt);
        await dbContext.SaveChangesAsync(cancellationToken);

        var created = await BuildQuery(dbContext).FirstAsync(current => current.Id == buildResult.Receipt.Id, cancellationToken);
        return TypedResults.Created(
            $"/api/transactions/bill-wise-receipts/{created.Id}",
            new ApiResponse<BillWiseReceiptDto>(true, "Bill wise receipt created successfully.", BillWiseReceiptDto.FromEntity(created)));
    }

    private static async Task<IResult> UpdateAsync(
        Guid id,
        UpdateBillWiseReceiptRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var receipt = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (receipt is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Bill wise receipt not found.", null));
        }

        var buildResult = BuildBillWiseReceiptRequest(
            request.Document,
            request.CustomerInformation,
            request.AccountInformation,
            request.ReceiptDetails,
            request.Allocations,
            request.Status,
            receipt.Status);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.Set<BillWiseReceipt>().AnyAsync(current => current.Id != id && current.No == buildResult.Receipt.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Bill wise receipt number already exists.", null));
        }

        var previousSettlements = receipt.Status == BillWiseDocumentStatus.Submitted
            ? receipt.Allocations
                .GroupBy(current => current.SalesInvoiceId)
                .ToDictionary(
                    group => group.Key,
                    group => Math.Round(group.Sum(item => item.PaidAmount + item.DiscountAmount), 2, MidpointRounding.AwayFromZero))
            : new Dictionary<Guid, decimal>();

        var resolutionError = await ResolveReferencesAsync(dbContext, buildResult.Receipt, previousSettlements, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        if (receipt.Status == BillWiseDocumentStatus.Submitted)
        {
            ReverseSettlements(receipt.Allocations);
        }

        receipt.No = buildResult.Receipt.No;
        receipt.Date = buildResult.Receipt.Date;
        receipt.ReferenceNo = buildResult.Receipt.ReferenceNo;
        receipt.InstrumentNo = buildResult.Receipt.InstrumentNo;
        receipt.InstrumentDate = buildResult.Receipt.InstrumentDate;
        receipt.Notes = buildResult.Receipt.Notes;
        receipt.TotalAllocated = buildResult.Receipt.TotalAllocated;
        receipt.TotalDiscount = buildResult.Receipt.TotalDiscount;
        receipt.Advance = buildResult.Receipt.Advance;
        receipt.Amount = buildResult.Receipt.Amount;
        receipt.Status = buildResult.Receipt.Status;
        receipt.UpdatedAtUtc = DateTime.UtcNow;
        receipt.VoucherType = BillWiseVoucherType.Receipt;
        receipt.CustomerInformation = buildResult.Receipt.CustomerInformation;
        receipt.AccountInformation = buildResult.Receipt.AccountInformation;

        dbContext.RemoveRange(receipt.Allocations);
        receipt.Allocations = buildResult.Receipt.Allocations;

        if (receipt.Status == BillWiseDocumentStatus.Submitted)
        {
            ApplySettlements(receipt.Allocations);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var updated = await BuildQuery(dbContext).FirstAsync(current => current.Id == id, cancellationToken);
        return TypedResults.Ok(new ApiResponse<BillWiseReceiptDto>(
            true,
            "Bill wise receipt updated successfully.",
            BillWiseReceiptDto.FromEntity(updated)));
    }

    private static async Task<IResult> DeleteAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var receipt = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (receipt is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Bill wise receipt not found.", null));
        }

        if (receipt.Status == BillWiseDocumentStatus.Submitted)
        {
            ReverseSettlements(receipt.Allocations);
        }

        dbContext.Set<BillWiseReceipt>().Remove(receipt);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Bill wise receipt deleted successfully.", null));
    }

    private static BillWiseReceiptBuildResult BuildBillWiseReceiptRequest(
        BillWiseReceiptDocumentRequest documentRequest,
        BillWiseReceiptCustomerInformationRequest customerInformationRequest,
        BillWiseReceiptAccountInformationRequest accountInformationRequest,
        BillWiseReceiptDetailsRequest receiptDetailsRequest,
        IReadOnlyList<BillWiseReceiptAllocationRequest> allocationsRequest,
        string? status,
        BillWiseDocumentStatus defaultStatus)
    {
        var receipt = new BillWiseReceipt
        {
            VoucherType = BillWiseVoucherType.Receipt,
            No = documentRequest.No?.Trim().ToUpperInvariant() ?? string.Empty,
            Date = documentRequest.Date,
            ReferenceNo = NormalizeOptional(receiptDetailsRequest.ReferenceNo),
            InstrumentNo = NormalizeOptional(receiptDetailsRequest.InstrumentNo),
            InstrumentDate = receiptDetailsRequest.InstrumentDate,
            Notes = NormalizeOptional(receiptDetailsRequest.Notes),
            Advance = RoundAmount(receiptDetailsRequest.Advance),
            Status = ParseStatus(status, defaultStatus),
            CustomerInformation = new BillWiseReceiptCustomerInformation
            {
                CustomerId = customerInformationRequest.CustomerId,
                CustomerNameSnapshot = customerInformationRequest.CustomerNameSnapshot?.Trim() ?? string.Empty,
                Address = customerInformationRequest.Address?.Trim() ?? string.Empty
            },
            AccountInformation = new BillWiseReceiptAccountInformation
            {
                LedgerId = accountInformationRequest.LedgerId,
                LedgerNameSnapshot = accountInformationRequest.LedgerNameSnapshot?.Trim() ?? string.Empty
            }
        };

        if (string.IsNullOrWhiteSpace(receipt.No))
        {
            return BillWiseReceiptBuildResult.Invalid("Bill wise receipt number is required.");
        }

        if (receipt.CustomerInformation.CustomerId == Guid.Empty)
        {
            return BillWiseReceiptBuildResult.Invalid("Customer is required.");
        }

        if (receipt.AccountInformation.LedgerId == Guid.Empty)
        {
            return BillWiseReceiptBuildResult.Invalid("Receipt account is required.");
        }

        if (receipt.Advance < 0)
        {
            return BillWiseReceiptBuildResult.Invalid("Advance cannot be negative.");
        }

        var allocations = new List<BillWiseReceiptAllocation>();
        foreach (var request in allocationsRequest ?? [])
        {
            var paidAmount = RoundAmount(request.PaidAmount);
            var discountAmount = RoundAmount(request.DiscountAmount);
            var settledAmount = paidAmount + discountAmount;

            if (request.SalesInvoiceId == Guid.Empty || settledAmount <= 0)
            {
                continue;
            }

            if (paidAmount < 0 || discountAmount < 0)
            {
                return BillWiseReceiptBuildResult.Invalid("Allocation values cannot be negative.");
            }

            allocations.Add(new BillWiseReceiptAllocation
            {
                Sno = request.Sno <= 0 ? allocations.Count + 1 : request.Sno,
                SalesInvoiceId = request.SalesInvoiceId,
                PaidAmount = paidAmount,
                DiscountAmount = discountAmount,
                SourceVoucherType = BillWiseSourceVoucherType.SalesInvoice
            });
        }

        if (allocations.Select(current => current.SalesInvoiceId).Distinct().Count() != allocations.Count)
        {
            return BillWiseReceiptBuildResult.Invalid("Each sales invoice can only be allocated once.");
        }

        if (allocations.Count == 0 && receipt.Advance <= 0)
        {
            return BillWiseReceiptBuildResult.Invalid("Add at least one allocation or enter an advance amount.");
        }

        receipt.Allocations = allocations;
        receipt.RecalculateTotals();

        return BillWiseReceiptBuildResult.Valid(receipt);
    }

    private static async Task<string?> ResolveReferencesAsync(
        AppDbContext dbContext,
        BillWiseReceipt receipt,
        IReadOnlyDictionary<Guid, decimal> previousSettlements,
        CancellationToken cancellationToken)
    {
        var customer = await dbContext.Customers.FirstOrDefaultAsync(current => current.Id == receipt.CustomerInformation.CustomerId, cancellationToken);
        if (customer is null)
        {
            return "Selected customer does not exist.";
        }

        receipt.CustomerInformation.Customer = customer;
        if (string.IsNullOrWhiteSpace(receipt.CustomerInformation.CustomerNameSnapshot))
        {
            receipt.CustomerInformation.CustomerNameSnapshot = customer.BasicDetails.Name;
        }

        if (string.IsNullOrWhiteSpace(receipt.CustomerInformation.Address))
        {
            receipt.CustomerInformation.Address = FormatCustomerAddress(customer);
        }

        var ledger = await dbContext.Ledgers
            .Include(current => current.LedgerGroup)
            .FirstOrDefaultAsync(current => current.Id == receipt.AccountInformation.LedgerId, cancellationToken);
        if (ledger is null)
        {
            return "Selected receipt account does not exist.";
        }

        var ledgerError = ValidateAccountLedger(ledger);
        if (ledgerError is not null)
        {
            return ledgerError;
        }

        receipt.AccountInformation.Ledger = ledger;
        if (string.IsNullOrWhiteSpace(receipt.AccountInformation.LedgerNameSnapshot))
        {
            receipt.AccountInformation.LedgerNameSnapshot = ledger.Name;
        }

        if (receipt.Allocations.Count == 0)
        {
            receipt.RecalculateTotals();
            return null;
        }

        var invoiceIds = receipt.Allocations.Select(current => current.SalesInvoiceId).Distinct().ToList();
        var invoices = await dbContext.SalesInvoices
            .Where(current => invoiceIds.Contains(current.Id))
            .ToDictionaryAsync(current => current.Id, cancellationToken);

        foreach (var allocation in receipt.Allocations)
        {
            if (!invoices.TryGetValue(allocation.SalesInvoiceId, out var invoice))
            {
                return "One or more selected sales invoices do not exist.";
            }

            if (invoice.Status == SalesInvoiceStatus.Cancelled)
            {
                return $"Sales invoice {invoice.Document.No} is cancelled.";
            }

            if (invoice.CustomerInformation.CustomerId != receipt.CustomerInformation.CustomerId)
            {
                return $"Sales invoice {invoice.Document.No} does not belong to the selected customer.";
            }

            var settledAmount = allocation.PaidAmount + allocation.DiscountAmount;
            var carryForward = previousSettlements.TryGetValue(invoice.Id, out var previousValue) ? previousValue : 0;
            var outstandingBefore = RoundAmount(invoice.FinancialDetails.Balance + carryForward);

            if (settledAmount > outstandingBefore)
            {
                return $"Allocation exceeds outstanding balance for sales invoice {invoice.Document.No}.";
            }

            allocation.SalesInvoice = invoice;
            allocation.SourceNo = invoice.Document.No;
            allocation.SourceDate = invoice.Document.Date;
            allocation.SourceDueDate = invoice.Document.DueDate;
            allocation.SourceReferenceNo = string.IsNullOrWhiteSpace(invoice.SourceRef.ReferenceNo) ? null : invoice.SourceRef.ReferenceNo;
            allocation.DescriptionSnapshot = NormalizeOptional(invoice.General.Notes);
            allocation.OriginalAmount = invoice.Footer.NetTotal;
            allocation.OutstandingBefore = outstandingBefore;
            allocation.Recalculate();
        }

        receipt.RecalculateTotals();
        return null;
    }

    private static void ApplySettlements(IEnumerable<BillWiseReceiptAllocation> allocations)
    {
        foreach (var allocation in allocations)
        {
            if (allocation.SalesInvoice is null)
            {
                continue;
            }

            var settledAmount = RoundAmount(allocation.PaidAmount + allocation.DiscountAmount);
            allocation.SalesInvoice.FinancialDetails.Balance = Math.Max(
                0,
                RoundAmount(allocation.SalesInvoice.FinancialDetails.Balance - settledAmount));
        }
    }

    private static void ReverseSettlements(IEnumerable<BillWiseReceiptAllocation> allocations)
    {
        foreach (var allocation in allocations)
        {
            if (allocation.SalesInvoice is null)
            {
                continue;
            }

            var settledAmount = RoundAmount(allocation.PaidAmount + allocation.DiscountAmount);
            allocation.SalesInvoice.FinancialDetails.Balance = RoundAmount(
                allocation.SalesInvoice.FinancialDetails.Balance + settledAmount);
        }
    }

    private static string? ValidateAccountLedger(Ledger ledger)
    {
        if (ledger.Status != LedgerStatuses.Active)
        {
            return "Selected receipt account must be active.";
        }

        if (!ledger.AllowManualPosting)
        {
            return "Selected receipt account must allow manual posting.";
        }

        if (ledger.IsBillWise)
        {
            return "Selected receipt account cannot be a bill-wise ledger.";
        }

        if (!string.Equals(ledger.LedgerGroup?.Nature, LedgerGroupNatures.Asset, StringComparison.OrdinalIgnoreCase))
        {
            return "Selected receipt account must belong to an asset ledger group.";
        }

        return null;
    }

    private static BillWiseDocumentStatus ParseStatus(string? value, BillWiseDocumentStatus defaultValue)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return defaultValue;
        }

        return value.Trim() switch
        {
            "Draft" => BillWiseDocumentStatus.Draft,
            "Cancelled" => BillWiseDocumentStatus.Cancelled,
            _ => BillWiseDocumentStatus.Submitted
        };
    }

    private static string ToStatusLabel(BillWiseDocumentStatus value) => value switch
    {
        BillWiseDocumentStatus.Draft => "Draft",
        BillWiseDocumentStatus.Cancelled => "Cancelled",
        _ => "Submitted"
    };

    private static string FormatCustomerAddress(Customer customer)
    {
        var parts = new[]
        {
            customer.BillingAddress.Street,
            customer.BillingAddress.City,
            customer.BillingAddress.State,
            customer.BillingAddress.Pincode,
            customer.BillingAddress.Country
        }
        .Where(current => !string.IsNullOrWhiteSpace(current))
        .Select(current => current!.Trim());

        return string.Join(", ", parts);
    }

    private static decimal RoundAmount(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed record BillWiseReceiptBuildResult(string? Error, BillWiseReceipt? Receipt = null)
    {
        public BillWiseReceipt Receipt { get; init; } = Receipt ?? new BillWiseReceipt();

        public static BillWiseReceiptBuildResult Valid(BillWiseReceipt receipt) => new(null, receipt);

        public static BillWiseReceiptBuildResult Invalid(string error) => new(error);
    }
}
