namespace backend.Features.Accounting.Journals;

public sealed record CreateManualJournalVoucherRequest(
    string VoucherNo,
    DateOnly PostingDate,
    string? Narration,
    IReadOnlyList<CreateManualJournalEntryRequest> Entries);

public sealed record CreateManualJournalEntryRequest(
    Guid LedgerId,
    decimal DebitAmount,
    decimal CreditAmount);
