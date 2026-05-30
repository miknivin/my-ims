using backend.Infrastructure.Filtering;
using backend.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Accounting.Journals;

internal static class JournalEntryHandlers
{
    internal static async Task<IResult> GetListAsync(
        [AsParameters] JournalEntryFilter filter,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (filter.FromDate is not null && filter.ToDate is not null && filter.FromDate > filter.ToDate)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "From date cannot be greater than to date.", null));
        }

        var page = filter.GetNormalizedPage();
        var limit = filter.GetNormalizedLimit();
        var status = NormalizeStatus(filter.Status);
        var source = NormalizeSource(filter.Source);
        var keyword = filter.Keyword?.Trim();
        var keywordPattern = $"%{keyword}%";

        var query = dbContext.JournalEntries
            .AsNoTracking()
            .WhereIf(filter.FromDate is not null, current => current.PostingDate >= filter.FromDate!.Value)
            .WhereIf(filter.ToDate is not null, current => current.PostingDate <= filter.ToDate!.Value)
            .WhereIf(filter.LedgerId is not null, current => current.LedgerId == filter.LedgerId!.Value)
            .WhereIf(status is not null, current => current.JournalVoucher != null && current.JournalVoucher.Status == status!.Value)
            .WhereIf(source == "Manual", current => current.VoucherType == JournalVoucherType.ManualJournal)
            .WhereIf(source == "Auto", current => current.VoucherType != JournalVoucherType.ManualJournal)
            .WhereIf(!string.IsNullOrWhiteSpace(keyword), current =>
                EF.Functions.ILike(current.VoucherNo, keywordPattern) ||
                (current.Narration != null && EF.Functions.ILike(current.Narration, keywordPattern)) ||
                (current.Ledger != null && (
                    EF.Functions.ILike(current.Ledger.Name, keywordPattern) ||
                    EF.Functions.ILike(current.Ledger.Code, keywordPattern))));

        var total = await query.CountAsync(cancellationToken);
        var totals = new JournalEntryTotalsDto(
            await query.SumAsync(current => (decimal?)current.DebitAmount, cancellationToken) ?? 0,
            await query.SumAsync(current => (decimal?)current.CreditAmount, cancellationToken) ?? 0);

        var rows = await ApplySorting(query, filter.SortBy)
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(current => new JournalEntryListItemDto(
                current.Id,
                current.JournalVoucherId,
                current.PostingDate,
                current.VoucherNo,
                current.VoucherType == JournalVoucherType.ManualJournal ? "Manual" : "Auto",
                current.JournalVoucher != null && current.JournalVoucher.Status == JournalVoucherStatus.Posted
                    ? "Posted"
                    : current.JournalVoucher != null && current.JournalVoucher.Status == JournalVoucherStatus.Reversed
                        ? "Reversed"
                        : "Draft",
                current.LineNo,
                current.LedgerId,
                current.Ledger != null ? current.Ledger.Name : string.Empty,
                current.Ledger != null ? current.Ledger.Code : string.Empty,
                current.Narration,
                current.DebitAmount,
                current.CreditAmount))
            .ToListAsync(cancellationToken);

        var totalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)limit);
        var response = new JournalEntryListResponse(
            rows,
            totals,
            page,
            limit,
            total,
            totalPages,
            filter.SortBy,
            filter.Keyword);

        return TypedResults.Ok(new ApiResponse<JournalEntryListResponse>(
            true,
            "Journal entry list fetched successfully.",
            response));
    }

    private static IQueryable<JournalEntry> ApplySorting(
        IQueryable<JournalEntry> query,
        string? sortBy) =>
        sortBy?.Trim() switch
        {
            "date" => query.OrderBy(current => current.PostingDate).ThenBy(current => current.VoucherNo).ThenBy(current => current.LineNo),
            "voucherNo" => query.OrderBy(current => current.VoucherNo).ThenBy(current => current.LineNo),
            "voucherNo_desc" => query.OrderByDescending(current => current.VoucherNo).ThenBy(current => current.LineNo),
            "ledger" => query.OrderBy(current => current.Ledger!.Name).ThenByDescending(current => current.PostingDate),
            "debit_desc" => query.OrderByDescending(current => current.DebitAmount),
            "credit_desc" => query.OrderByDescending(current => current.CreditAmount),
            _ => query.OrderByDescending(current => current.PostingDate).ThenByDescending(current => current.VoucherNo).ThenBy(current => current.LineNo)
        };

    private static JournalVoucherStatus? NormalizeStatus(string? value) =>
        value?.Trim() switch
        {
            "Draft" => JournalVoucherStatus.Draft,
            "Posted" => JournalVoucherStatus.Posted,
            "Reversed" => JournalVoucherStatus.Reversed,
            _ => null
        };

    private static string? NormalizeSource(string? value) =>
        value?.Trim() switch
        {
            "Manual" => "Manual",
            "Auto" => "Auto",
            _ => null
        };
}
