namespace backend.Features.Masters.Ledgers;

public sealed record CreateLedgerRequest(
    string Code,
    string Name,
    string? Alias,
    Guid LedgerGroupId,
    Guid? DefaultCurrencyId,
    string? Status,
    bool AllowManualPosting,
    bool IsBillWise);

public sealed record UpdateLedgerRequest(
    string Code,
    string Name,
    string? Alias,
    Guid LedgerGroupId,
    Guid? DefaultCurrencyId,
    string? Status,
    bool AllowManualPosting,
    bool IsBillWise);
