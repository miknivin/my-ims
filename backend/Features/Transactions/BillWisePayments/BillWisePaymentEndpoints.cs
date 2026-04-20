using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Vendors;
using backend.Features.Transactions.PurchaseInvoices;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Transactions.BillWisePayments;

public static class BillWisePaymentEndpoints
{
    public static IEndpointRouteBuilder MapBillWisePaymentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/bill-wise-payments").WithTags("Bill Wise Payments");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/outstanding-invoices", GetOutstandingInvoicesAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPut("/{id:guid}", UpdateAsync);
        group.MapDelete("/{id:guid}", DeleteAsync);

        return app;
    }

    private static IQueryable<BillWisePayment> BuildQuery(AppDbContext dbContext)
    {
        return dbContext.Set<BillWisePayment>()
            .Include(current => current.VendorInformation.Vendor)
            .Include(current => current.AccountInformation.Ledger)
            .Include(current => current.Allocations)
                .ThenInclude(current => current.PurchaseInvoice);
    }

    private static async Task<IResult> GetAllAsync(AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var payments = await dbContext.Set<BillWisePayment>()
            .AsNoTracking()
            .OrderByDescending(current => current.UpdatedAtUtc)
            .Select(current => new BillWisePaymentListItemDto(
                current.Id,
                current.No,
                current.Date,
                current.VendorInformation.VendorNameSnapshot,
                current.Amount,
                current.TotalAllocated,
                current.TotalDiscount,
                current.Advance,
                ToStatusLabel(current.Status),
                current.CreatedAtUtc,
                current.UpdatedAtUtc))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<BillWisePaymentListItemDto>>(
            true,
            "Bill wise payment list fetched successfully.",
            payments));
    }

    private static async Task<IResult> GetOutstandingInvoicesAsync(
        Guid vendorId,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (vendorId == Guid.Empty)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "Vendor is required.", null));
        }

        var items = await dbContext.PurchaseInvoices
            .AsNoTracking()
            .Where(current =>
                current.VendorInformation.VendorId == vendorId &&
                current.Status != PurchaseInvoiceStatus.Cancelled &&
                current.FinancialDetails.Balance > 0)
            .OrderBy(current => current.Document.Date)
            .ThenBy(current => current.Document.No)
            .Select(current => new BillWisePaymentOutstandingInvoiceDto(
                current.Id,
                current.Document.No,
                current.Document.Date,
                current.Document.DueDate,
                current.SourceRef.ReferenceNo,
                current.General.Notes,
                current.Footer.NetTotal,
                current.FinancialDetails.Balance))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<BillWisePaymentOutstandingInvoiceDto>>(
            true,
            "Outstanding purchase invoices fetched successfully.",
            items));
    }

    private static async Task<IResult> GetByIdAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var payment = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return payment is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Bill wise payment not found.", null))
            : TypedResults.Ok(new ApiResponse<BillWisePaymentDto>(
                true,
                "Bill wise payment fetched successfully.",
                BillWisePaymentDto.FromEntity(payment)));
    }

    private static async Task<IResult> CreateAsync(
        CreateBillWisePaymentRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildBillWisePaymentRequest(
            request.Document,
            request.VendorInformation,
            request.AccountInformation,
            request.PaymentDetails,
            request.Allocations,
            request.Status,
            BillWiseDocumentStatus.Submitted);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.Set<BillWisePayment>().AnyAsync(current => current.No == buildResult.Payment.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Bill wise payment number already exists.", null));
        }

        var resolutionError = await ResolveReferencesAsync(
            dbContext,
            buildResult.Payment,
            new Dictionary<Guid, decimal>(),
            cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        var now = DateTime.UtcNow;
        buildResult.Payment.CreatedAtUtc = now;
        buildResult.Payment.UpdatedAtUtc = now;

        if (buildResult.Payment.Status == BillWiseDocumentStatus.Submitted)
        {
            ApplySettlements(buildResult.Payment.Allocations);
        }

        dbContext.Set<BillWisePayment>().Add(buildResult.Payment);
        await dbContext.SaveChangesAsync(cancellationToken);

        var created = await BuildQuery(dbContext).FirstAsync(current => current.Id == buildResult.Payment.Id, cancellationToken);
        return TypedResults.Created(
            $"/api/transactions/bill-wise-payments/{created.Id}",
            new ApiResponse<BillWisePaymentDto>(true, "Bill wise payment created successfully.", BillWisePaymentDto.FromEntity(created)));
    }

    private static async Task<IResult> UpdateAsync(
        Guid id,
        UpdateBillWisePaymentRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var payment = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (payment is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Bill wise payment not found.", null));
        }

        var buildResult = BuildBillWisePaymentRequest(
            request.Document,
            request.VendorInformation,
            request.AccountInformation,
            request.PaymentDetails,
            request.Allocations,
            request.Status,
            payment.Status);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.Set<BillWisePayment>().AnyAsync(current => current.Id != id && current.No == buildResult.Payment.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Bill wise payment number already exists.", null));
        }

        var previousSettlements = payment.Status == BillWiseDocumentStatus.Submitted
            ? payment.Allocations
                .GroupBy(current => current.PurchaseInvoiceId)
                .ToDictionary(
                    group => group.Key,
                    group => Math.Round(group.Sum(item => item.PaidAmount + item.DiscountAmount), 2, MidpointRounding.AwayFromZero))
            : new Dictionary<Guid, decimal>();

        var resolutionError = await ResolveReferencesAsync(dbContext, buildResult.Payment, previousSettlements, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        if (payment.Status == BillWiseDocumentStatus.Submitted)
        {
            ReverseSettlements(payment.Allocations);
        }

        payment.No = buildResult.Payment.No;
        payment.Date = buildResult.Payment.Date;
        payment.ReferenceNo = buildResult.Payment.ReferenceNo;
        payment.InstrumentNo = buildResult.Payment.InstrumentNo;
        payment.InstrumentDate = buildResult.Payment.InstrumentDate;
        payment.Notes = buildResult.Payment.Notes;
        payment.TotalAllocated = buildResult.Payment.TotalAllocated;
        payment.TotalDiscount = buildResult.Payment.TotalDiscount;
        payment.Advance = buildResult.Payment.Advance;
        payment.Amount = buildResult.Payment.Amount;
        payment.Status = buildResult.Payment.Status;
        payment.UpdatedAtUtc = DateTime.UtcNow;
        payment.VoucherType = BillWiseVoucherType.Payment;
        payment.VendorInformation = buildResult.Payment.VendorInformation;
        payment.AccountInformation = buildResult.Payment.AccountInformation;

        dbContext.RemoveRange(payment.Allocations);
        payment.Allocations = buildResult.Payment.Allocations;

        if (payment.Status == BillWiseDocumentStatus.Submitted)
        {
            ApplySettlements(payment.Allocations);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var updated = await BuildQuery(dbContext).FirstAsync(current => current.Id == id, cancellationToken);
        return TypedResults.Ok(new ApiResponse<BillWisePaymentDto>(
            true,
            "Bill wise payment updated successfully.",
            BillWisePaymentDto.FromEntity(updated)));
    }

    private static async Task<IResult> DeleteAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var payment = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (payment is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Bill wise payment not found.", null));
        }

        if (payment.Status == BillWiseDocumentStatus.Submitted)
        {
            ReverseSettlements(payment.Allocations);
        }

        dbContext.Set<BillWisePayment>().Remove(payment);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Bill wise payment deleted successfully.", null));
    }

    private static BillWisePaymentBuildResult BuildBillWisePaymentRequest(
        BillWisePaymentDocumentRequest documentRequest,
        BillWisePaymentVendorInformationRequest vendorInformationRequest,
        BillWisePaymentAccountInformationRequest accountInformationRequest,
        BillWisePaymentPaymentDetailsRequest paymentDetailsRequest,
        IReadOnlyList<BillWisePaymentAllocationRequest> allocationsRequest,
        string? status,
        BillWiseDocumentStatus defaultStatus)
    {
        var payment = new BillWisePayment
        {
            VoucherType = BillWiseVoucherType.Payment,
            No = documentRequest.No?.Trim().ToUpperInvariant() ?? string.Empty,
            Date = documentRequest.Date,
            ReferenceNo = NormalizeOptional(paymentDetailsRequest.ReferenceNo),
            InstrumentNo = NormalizeOptional(paymentDetailsRequest.InstrumentNo),
            InstrumentDate = paymentDetailsRequest.InstrumentDate,
            Notes = NormalizeOptional(paymentDetailsRequest.Notes),
            Advance = RoundAmount(paymentDetailsRequest.Advance),
            Status = ParseStatus(status, defaultStatus),
            VendorInformation = new BillWisePaymentVendorInformation
            {
                VendorId = vendorInformationRequest.VendorId,
                VendorNameSnapshot = vendorInformationRequest.VendorNameSnapshot?.Trim() ?? string.Empty,
                Address = vendorInformationRequest.Address?.Trim() ?? string.Empty,
                Attention = NormalizeOptional(vendorInformationRequest.Attention),
                Phone = NormalizeOptional(vendorInformationRequest.Phone)
            },
            AccountInformation = new BillWisePaymentAccountInformation
            {
                LedgerId = accountInformationRequest.LedgerId,
                LedgerNameSnapshot = accountInformationRequest.LedgerNameSnapshot?.Trim() ?? string.Empty
            }
        };

        if (string.IsNullOrWhiteSpace(payment.No))
        {
            return BillWisePaymentBuildResult.Invalid("Bill wise payment number is required.");
        }

        if (payment.VendorInformation.VendorId == Guid.Empty)
        {
            return BillWisePaymentBuildResult.Invalid("Vendor is required.");
        }

        if (payment.AccountInformation.LedgerId == Guid.Empty)
        {
            return BillWisePaymentBuildResult.Invalid("Payment account is required.");
        }

        if (payment.Advance < 0)
        {
            return BillWisePaymentBuildResult.Invalid("Advance cannot be negative.");
        }

        var allocations = new List<BillWisePaymentAllocation>();
        foreach (var request in allocationsRequest ?? [])
        {
            var paidAmount = RoundAmount(request.PaidAmount);
            var discountAmount = RoundAmount(request.DiscountAmount);
            var settledAmount = paidAmount + discountAmount;

            if (request.PurchaseInvoiceId == Guid.Empty || settledAmount <= 0)
            {
                continue;
            }

            if (paidAmount < 0 || discountAmount < 0)
            {
                return BillWisePaymentBuildResult.Invalid("Allocation values cannot be negative.");
            }

            allocations.Add(new BillWisePaymentAllocation
            {
                Sno = request.Sno <= 0 ? allocations.Count + 1 : request.Sno,
                PurchaseInvoiceId = request.PurchaseInvoiceId,
                PaidAmount = paidAmount,
                DiscountAmount = discountAmount,
                SourceVoucherType = BillWiseSourceVoucherType.PurchaseInvoice
            });
        }

        if (allocations.Select(current => current.PurchaseInvoiceId).Distinct().Count() != allocations.Count)
        {
            return BillWisePaymentBuildResult.Invalid("Each purchase invoice can only be allocated once.");
        }

        if (allocations.Count == 0 && payment.Advance <= 0)
        {
            return BillWisePaymentBuildResult.Invalid("Add at least one allocation or enter an advance amount.");
        }

        payment.Allocations = allocations;
        payment.RecalculateTotals();

        return BillWisePaymentBuildResult.Valid(payment);
    }

    private static async Task<string?> ResolveReferencesAsync(
        AppDbContext dbContext,
        BillWisePayment payment,
        IReadOnlyDictionary<Guid, decimal> previousSettlements,
        CancellationToken cancellationToken)
    {
        var vendor = await dbContext.Vendors.FirstOrDefaultAsync(current => current.Id == payment.VendorInformation.VendorId, cancellationToken);
        if (vendor is null)
        {
            return "Selected vendor does not exist.";
        }

        payment.VendorInformation.Vendor = vendor;
        if (string.IsNullOrWhiteSpace(payment.VendorInformation.VendorNameSnapshot))
        {
            payment.VendorInformation.VendorNameSnapshot = vendor.BasicInfo.Name;
        }

        if (string.IsNullOrWhiteSpace(payment.VendorInformation.Address))
        {
            payment.VendorInformation.Address = vendor.AddressAndContact.Address ?? string.Empty;
        }

        var ledger = await dbContext.Ledgers
            .Include(current => current.LedgerGroup)
            .FirstOrDefaultAsync(current => current.Id == payment.AccountInformation.LedgerId, cancellationToken);
        if (ledger is null)
        {
            return "Selected payment account does not exist.";
        }

        var ledgerError = ValidateAccountLedger(ledger);
        if (ledgerError is not null)
        {
            return ledgerError;
        }

        payment.AccountInformation.Ledger = ledger;
        if (string.IsNullOrWhiteSpace(payment.AccountInformation.LedgerNameSnapshot))
        {
            payment.AccountInformation.LedgerNameSnapshot = ledger.Name;
        }

        if (payment.Allocations.Count == 0)
        {
            payment.RecalculateTotals();
            return null;
        }

        var invoiceIds = payment.Allocations.Select(current => current.PurchaseInvoiceId).Distinct().ToList();
        var invoices = await dbContext.PurchaseInvoices
            .Where(current => invoiceIds.Contains(current.Id))
            .ToDictionaryAsync(current => current.Id, cancellationToken);

        foreach (var allocation in payment.Allocations)
        {
            if (!invoices.TryGetValue(allocation.PurchaseInvoiceId, out var invoice))
            {
                return "One or more selected purchase invoices do not exist.";
            }

            if (invoice.Status == PurchaseInvoiceStatus.Cancelled)
            {
                return $"Purchase invoice {invoice.Document.No} is cancelled.";
            }

            if (invoice.VendorInformation.VendorId != payment.VendorInformation.VendorId)
            {
                return $"Purchase invoice {invoice.Document.No} does not belong to the selected vendor.";
            }

            var settledAmount = allocation.PaidAmount + allocation.DiscountAmount;
            var carryForward = previousSettlements.TryGetValue(invoice.Id, out var previousValue) ? previousValue : 0;
            var outstandingBefore = RoundAmount(invoice.FinancialDetails.Balance + carryForward);

            if (settledAmount > outstandingBefore)
            {
                return $"Allocation exceeds outstanding balance for purchase invoice {invoice.Document.No}.";
            }

            allocation.PurchaseInvoice = invoice;
            allocation.SourceNo = invoice.Document.No;
            allocation.SourceDate = invoice.Document.Date;
            allocation.SourceDueDate = invoice.Document.DueDate;
            allocation.SourceReferenceNo = string.IsNullOrWhiteSpace(invoice.SourceRef.ReferenceNo) ? null : invoice.SourceRef.ReferenceNo;
            allocation.DescriptionSnapshot = NormalizeOptional(invoice.General.Notes);
            allocation.OriginalAmount = invoice.Footer.NetTotal;
            allocation.OutstandingBefore = outstandingBefore;
            allocation.Recalculate();
        }

        payment.RecalculateTotals();
        return null;
    }

    private static void ApplySettlements(IEnumerable<BillWisePaymentAllocation> allocations)
    {
        foreach (var allocation in allocations)
        {
            if (allocation.PurchaseInvoice is null)
            {
                continue;
            }

            var settledAmount = RoundAmount(allocation.PaidAmount + allocation.DiscountAmount);
            allocation.PurchaseInvoice.FinancialDetails.Balance = Math.Max(
                0,
                RoundAmount(allocation.PurchaseInvoice.FinancialDetails.Balance - settledAmount));
        }
    }

    private static void ReverseSettlements(IEnumerable<BillWisePaymentAllocation> allocations)
    {
        foreach (var allocation in allocations)
        {
            if (allocation.PurchaseInvoice is null)
            {
                continue;
            }

            var settledAmount = RoundAmount(allocation.PaidAmount + allocation.DiscountAmount);
            allocation.PurchaseInvoice.FinancialDetails.Balance = RoundAmount(
                allocation.PurchaseInvoice.FinancialDetails.Balance + settledAmount);
        }
    }

    private static string? ValidateAccountLedger(Ledger ledger)
    {
        if (ledger.Status != LedgerStatuses.Active)
        {
            return "Selected payment account must be active.";
        }

        if (!ledger.AllowManualPosting)
        {
            return "Selected payment account must allow manual posting.";
        }

        if (ledger.IsBillWise)
        {
            return "Selected payment account cannot be a bill-wise ledger.";
        }

        if (!string.Equals(ledger.LedgerGroup?.Nature, LedgerGroupNatures.Asset, StringComparison.OrdinalIgnoreCase))
        {
            return "Selected payment account must belong to an asset ledger group.";
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

    private static decimal RoundAmount(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed record BillWisePaymentBuildResult(string? Error, BillWisePayment? Payment = null)
    {
        public BillWisePayment Payment { get; init; } = Payment ?? new BillWisePayment();

        public static BillWisePaymentBuildResult Valid(BillWisePayment payment) => new(null, payment);

        public static BillWisePaymentBuildResult Invalid(string error) => new(error);
    }
}
