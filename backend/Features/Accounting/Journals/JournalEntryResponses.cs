namespace backend.Features.Accounting.Journals;

public sealed record JournalEntryListItemDto(
    Guid Id,
    Guid JournalVoucherId,
    DateOnly PostingDate,
    string VoucherNo,
    string Source,
    string Status,
    int LineNo,
    Guid LedgerId,
    string LedgerName,
    string LedgerCode,
    string? Narration,
    decimal DebitAmount,
    decimal CreditAmount);

public sealed record JournalEntryTotalsDto(
    decimal DebitAmount,
    decimal CreditAmount);

public sealed record JournalEntryListResponse(
    IReadOnlyList<JournalEntryListItemDto> Items,
    JournalEntryTotalsDto Totals,
    int Page,
    int Limit,
    int Total,
    int TotalPages,
    string? SortBy,
    string? Keyword);
