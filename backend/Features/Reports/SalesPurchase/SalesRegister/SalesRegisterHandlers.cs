using backend.Features.Transactions.SalesInvoices;
using backend.Infrastructure.Filtering;
using backend.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Reports.SalesPurchase.SalesRegister;

internal static class SalesRegisterHandlers
{
    internal static async Task<IResult> GetAsync(
        [AsParameters] SalesRegisterFilter filter,
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
            dbContext.SalesInvoices.AsNoTracking(),
            filter);

        var total = await query.CountAsync(cancellationToken);
        var invoiceIds = query.Select(current => current.Id);
        var grossAmount = await dbContext.SalesInvoiceLineItems
            .AsNoTracking()
            .Where(current => invoiceIds.Contains(current.SalesInvoiceId))
            .SumAsync(current => (decimal?)current.GrossAmount, cancellationToken) ?? 0;
        var discountAmount = await dbContext.SalesInvoiceLineItems
            .AsNoTracking()
            .Where(current => invoiceIds.Contains(current.SalesInvoiceId))
            .SumAsync(current => (decimal?)current.DiscountAmount, cancellationToken) ?? 0;
        var taxableAmount = await dbContext.SalesInvoiceLineItems
            .AsNoTracking()
            .Where(current => invoiceIds.Contains(current.SalesInvoiceId))
            .SumAsync(current => (decimal?)current.TaxableAmount, cancellationToken) ?? 0;
        var taxAmount = await dbContext.SalesInvoiceLineItems
            .AsNoTracking()
            .Where(current => invoiceIds.Contains(current.SalesInvoiceId))
            .SumAsync(current => (decimal?)current.TaxAmount, cancellationToken) ?? 0;
        var additionAmount = await query.SumAsync(current => (decimal?)current.Footer.Addition, cancellationToken) ?? 0;
        var deductionAmount = await query.SumAsync(current => (decimal?)current.Footer.Deduction, cancellationToken) ?? 0;
        var netAmount = await query.SumAsync(current => (decimal?)current.Footer.NetTotal, cancellationToken) ?? 0;
        var outstandingAmount = await query.SumAsync(current => (decimal?)current.FinancialDetails.Balance, cancellationToken) ?? 0;
        var totals = new SalesRegisterTotalsDto(
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
            .Select(current => new SalesRegisterRowDto(
                current.Id,
                current.Document.Date,
                current.Document.DueDate,
                current.Document.No,
                string.IsNullOrWhiteSpace(current.FinancialDetails.InvoiceNo)
                    ? current.SourceRef.ReferenceNo
                    : current.FinancialDetails.InvoiceNo,
                current.CustomerInformation.CustomerId,
                current.CustomerInformation.CustomerNameSnapshot,
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
        var report = new SalesRegisterReportDto(
            rows,
            totals,
            page,
            limit,
            total,
            totalPages,
            filter.SortBy,
            filter.Keyword);

        return TypedResults.Ok(new ApiResponse<SalesRegisterReportDto>(
            true,
            "Sales register fetched successfully.",
            report));
    }

    private static IQueryable<SalesInvoice> ApplyFilters(
        IQueryable<SalesInvoice> query,
        SalesRegisterFilter filter)
    {
        var status = NormalizeStatus(filter.Status);
        var normalizedKeyword = filter.Keyword?.Trim();
        var keywordPattern = $"%{normalizedKeyword}%";

        return query
            .WhereIf(filter.FromDate is not null, current => current.Document.Date >= filter.FromDate!.Value)
            .WhereIf(filter.ToDate is not null, current => current.Document.Date <= filter.ToDate!.Value)
            .WhereIf(filter.CustomerId is not null, current => current.CustomerInformation.CustomerId == filter.CustomerId!.Value)
            .WhereIf(status is not null, current => current.Status == status!.Value)
            .WhereIf(!string.IsNullOrWhiteSpace(normalizedKeyword), current =>
                EF.Functions.ILike(current.Document.No, keywordPattern) ||
                EF.Functions.ILike(current.CustomerInformation.CustomerNameSnapshot, keywordPattern) ||
                (current.FinancialDetails.InvoiceNo != null && EF.Functions.ILike(current.FinancialDetails.InvoiceNo, keywordPattern)) ||
                EF.Functions.ILike(current.SourceRef.ReferenceNo, keywordPattern));
    }

    private static IQueryable<SalesInvoice> ApplySorting(
        IQueryable<SalesInvoice> query,
        SalesRegisterFilter filter)
    {
        return filter.SortBy?.Trim() switch
        {
            "date" => query.OrderBy(current => current.Document.Date).ThenBy(current => current.Document.No),
            "date_desc" => query.OrderByDescending(current => current.Document.Date).ThenByDescending(current => current.Document.No),
            "invoiceNo" => query.OrderBy(current => current.Document.No),
            "invoiceNo_desc" => query.OrderByDescending(current => current.Document.No),
            "customer" => query.OrderBy(current => current.CustomerInformation.CustomerNameSnapshot).ThenBy(current => current.Document.Date),
            "customer_desc" => query.OrderByDescending(current => current.CustomerInformation.CustomerNameSnapshot).ThenByDescending(current => current.Document.Date),
            "netAmount" => query.OrderBy(current => current.Footer.NetTotal),
            "netAmount_desc" => query.OrderByDescending(current => current.Footer.NetTotal),
            "outstanding" => query.OrderBy(current => current.FinancialDetails.Balance),
            "outstanding_desc" => query.OrderByDescending(current => current.FinancialDetails.Balance),
            _ => query.OrderByDescending(current => current.Document.Date).ThenByDescending(current => current.Document.No)
        };
    }

    private static SalesInvoiceStatus? NormalizeStatus(string? value)
    {
        return value?.Trim() switch
        {
            "Draft" => SalesInvoiceStatus.Draft,
            "Submitted" => SalesInvoiceStatus.Submitted,
            "Cancelled" => SalesInvoiceStatus.Cancelled,
            _ => null
        };
    }

    private static string ToStatusLabel(SalesInvoiceStatus value) => value switch
    {
        SalesInvoiceStatus.Submitted => "Submitted",
        SalesInvoiceStatus.Cancelled => "Cancelled",
        _ => "Draft"
    };

}
