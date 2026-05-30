using backend.Infrastructure.Filtering;

namespace backend.Features.Accounting.Journals;

public sealed record JournalVoucherListItemDto(
    Guid Id,
    string VoucherNo,
    DateOnly PostingDate,
    string Source,
    string Status,
    string? Narration,
    decimal TotalDebit,
    decimal TotalCredit);

public sealed record JournalVoucherDto(
    Guid Id,
    string VoucherNo,
    DateOnly PostingDate,
    string Source,
    string Status,
    string? Narration,
    decimal TotalDebit,
    decimal TotalCredit,
    IReadOnlyList<JournalEntryDto> Entries)
{
    public static JournalVoucherDto FromEntity(JournalVoucher voucher)
    {
        var entries = voucher.Entries
            .OrderBy(current => current.LineNo)
            .Select(current => new JournalEntryDto(
                current.Id,
                current.LineNo,
                current.LedgerId,
                current.Ledger?.Name ?? string.Empty,
                current.Ledger?.Code ?? string.Empty,
                current.DebitAmount,
                current.CreditAmount))
            .ToList();

        return new JournalVoucherDto(
            voucher.Id,
            voucher.VoucherNo,
            voucher.PostingDate,
            JournalVoucherLabels.ToSourceLabel(voucher),
            JournalVoucherLabels.ToStatusLabel(voucher.Status),
            voucher.Narration,
            entries.Sum(current => current.DebitAmount),
            entries.Sum(current => current.CreditAmount),
            entries);
    }
}

public sealed record JournalEntryDto(
    Guid Id,
    int LineNo,
    Guid LedgerId,
    string LedgerName,
    string LedgerCode,
    decimal DebitAmount,
    decimal CreditAmount);

public sealed record JournalVoucherListResponse(
    IReadOnlyList<JournalVoucherListItemDto> Items,
    int Page,
    int Limit,
    int Total,
    int TotalPages,
    string? SortBy,
    string? Keyword)
{
    public static JournalVoucherListResponse FromPaged(PagedResponse<JournalVoucherListItemDto> paged) =>
        new(
            paged.Items,
            paged.Page,
            paged.Limit,
            paged.Total,
            paged.TotalPages,
            paged.SortBy,
            paged.Keyword);
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);

internal static class JournalVoucherLabels
{
    public static string ToSourceLabel(JournalVoucher voucher) =>
        voucher.VoucherType == JournalVoucherType.ManualJournal ? "Manual" : "Auto";

    public static string ToStatusLabel(JournalVoucherStatus status) => status switch
    {
        JournalVoucherStatus.Posted => "Posted",
        JournalVoucherStatus.Reversed => "Reversed",
        _ => "Draft"
    };
}
