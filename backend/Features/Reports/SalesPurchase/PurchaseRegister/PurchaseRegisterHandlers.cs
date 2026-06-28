using backend.Features.Transactions.PurchaseInvoices;
using backend.Infrastructure.Filtering;
using backend.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Reports.SalesPurchase.PurchaseRegister;

internal static class PurchaseRegisterHandlers
{
    internal static async Task<IResult> GetAsync(
        [AsParameters] PurchaseRegisterFilter filter,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (filter.FromDate is not null && filter.ToDate is not null && filter.FromDate > filter.ToDate)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "From date cannot be greater than to date.", null));
        }

        var page = filter.GetNormalizedPage();
        var limit = filter.GetNormalizedLimit();

        var query = ApplyFilters(
            dbContext.PurchaseInvoices.AsNoTracking(),
            filter);

        var total = await query.CountAsync(cancellationToken);
        var invoiceIds = query.Select(current => current.Id);
        var grossAmount = await dbContext.PurchaseInvoiceLineItems
            .AsNoTracking()
            .Where(current => invoiceIds.Contains(current.PurchaseInvoiceId))
            .SumAsync(current => (decimal?)current.GrossAmount, cancellationToken) ?? 0;
        var discountAmount = await dbContext.PurchaseInvoiceLineItems
            .AsNoTracking()
            .Where(current => invoiceIds.Contains(current.PurchaseInvoiceId))
            .SumAsync(current => (decimal?)current.DiscountAmount, cancellationToken) ?? 0;
        var taxableAmount = await dbContext.PurchaseInvoiceLineItems
            .AsNoTracking()
            .Where(current => invoiceIds.Contains(current.PurchaseInvoiceId))
            .SumAsync(current => (decimal?)current.TaxableAmount, cancellationToken) ?? 0;
        var taxAmount = await dbContext.PurchaseInvoiceLineItems
            .AsNoTracking()
            .Where(current => invoiceIds.Contains(current.PurchaseInvoiceId))
            .SumAsync(current => (decimal?)current.TaxAmount, cancellationToken) ?? 0;
        var additionAmount = await query.SumAsync(current => (decimal?)current.Footer.Addition, cancellationToken) ?? 0;
        var deductionAmount = await query.SumAsync(current => (decimal?)current.Footer.Deduction, cancellationToken) ?? 0;
        var netAmount = await query.SumAsync(current => (decimal?)current.Footer.NetTotal, cancellationToken) ?? 0;
        var outstandingAmount = await query.SumAsync(current => (decimal?)current.FinancialDetails.Balance, cancellationToken) ?? 0;
        var totals = new PurchaseRegisterTotalsDto(
            grossAmount,
            discountAmount,
            additionAmount,
            deductionAmount,
            taxableAmount,
            taxAmount,
            netAmount,
            netAmount - outstandingAmount,
            outstandingAmount);

        var sortedQuery = ApplySorting(query, filter);
        var rows = await sortedQuery
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(current => new PurchaseRegisterRowDto(
                current.Id,
                current.Document.Date,
                current.Document.DueDate,
                current.Document.No,
                string.IsNullOrWhiteSpace(current.FinancialDetails.SupplierInvoiceNo)
                    ? current.SourceRef.ReferenceNo
                    : current.FinancialDetails.SupplierInvoiceNo,
                current.VendorInformation.VendorId,
                current.VendorInformation.VendorNameSnapshot,
                current.Items.Sum(item => item.GrossAmount),
                current.Items.Sum(item => item.DiscountAmount),
                current.Footer.Addition,
                current.Footer.Deduction,
                current.Items.Sum(item => item.TaxableAmount),
                current.Items.Sum(item => item.TaxAmount),
                current.Footer.NetTotal,
                current.Footer.NetTotal - current.FinancialDetails.Balance,
                current.FinancialDetails.Balance,
                ToStatusLabel(current.Status)))
            .ToListAsync(cancellationToken);

        var totalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)limit);
        var report = new PurchaseRegisterReportDto(
            rows,
            totals,
            page,
            limit,
            total,
            totalPages,
            filter.SortBy,
            filter.Keyword);

        return TypedResults.Ok(new ApiResponse<PurchaseRegisterReportDto>(
            true,
            "Purchase register fetched successfully.",
            report));
    }

    private static IQueryable<PurchaseInvoice> ApplyFilters(
        IQueryable<PurchaseInvoice> query,
        PurchaseRegisterFilter filter)
    {
        var status = NormalizeStatus(filter.Status);
        var normalizedKeyword = filter.Keyword?.Trim();
        var keywordPattern = $"%{normalizedKeyword}%";

        return query
            .WhereIf(filter.FromDate is not null, current => current.Document.Date >= filter.FromDate!.Value)
            .WhereIf(filter.ToDate is not null, current => current.Document.Date <= filter.ToDate!.Value)
            .WhereIf(filter.VendorId is not null, current => current.VendorInformation.VendorId == filter.VendorId!.Value)
            .WhereIf(status is not null, current => current.Status == status!.Value)
            .WhereIf(!string.IsNullOrWhiteSpace(normalizedKeyword), current =>
                EF.Functions.ILike(current.Document.No, keywordPattern) ||
                EF.Functions.ILike(current.VendorInformation.VendorNameSnapshot, keywordPattern) ||
                (current.FinancialDetails.SupplierInvoiceNo != null && EF.Functions.ILike(current.FinancialDetails.SupplierInvoiceNo, keywordPattern)) ||
                EF.Functions.ILike(current.SourceRef.ReferenceNo, keywordPattern));
    }

    private static IQueryable<PurchaseInvoice> ApplySorting(
        IQueryable<PurchaseInvoice> query,
        PurchaseRegisterFilter filter)
    {
        return filter.SortBy?.Trim() switch
        {
            "date" => query.OrderBy(current => current.Document.Date).ThenBy(current => current.Document.No),
            "date_desc" => query.OrderByDescending(current => current.Document.Date).ThenByDescending(current => current.Document.No),
            "invoiceNo" => query.OrderBy(current => current.Document.No),
            "invoiceNo_desc" => query.OrderByDescending(current => current.Document.No),
            "vendor" => query.OrderBy(current => current.VendorInformation.VendorNameSnapshot).ThenBy(current => current.Document.Date),
            "vendor_desc" => query.OrderByDescending(current => current.VendorInformation.VendorNameSnapshot).ThenByDescending(current => current.Document.Date),
            "netAmount" => query.OrderBy(current => current.Footer.NetTotal),
            "netAmount_desc" => query.OrderByDescending(current => current.Footer.NetTotal),
            "outstanding" => query.OrderBy(current => current.FinancialDetails.Balance),
            "outstanding_desc" => query.OrderByDescending(current => current.FinancialDetails.Balance),
            _ => query.OrderByDescending(current => current.Document.Date).ThenByDescending(current => current.Document.No)
        };
    }

    private static PurchaseInvoiceStatus? NormalizeStatus(string? value)
    {
        return value?.Trim() switch
        {
            "Draft" => PurchaseInvoiceStatus.Draft,
            "Submitted" => PurchaseInvoiceStatus.Submitted,
            "Cancelled" => PurchaseInvoiceStatus.Cancelled,
            _ => null
        };
    }

    private static string ToStatusLabel(PurchaseInvoiceStatus value) => value switch
    {
        PurchaseInvoiceStatus.Submitted => "Submitted",
        PurchaseInvoiceStatus.Cancelled => "Cancelled",
        _ => "Draft"
    };
}
