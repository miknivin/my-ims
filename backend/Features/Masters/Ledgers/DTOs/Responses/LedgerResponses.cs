namespace backend.Features.Masters.Ledgers;

public sealed record LedgerDto(
    Guid Id,
    string Code,
    string Name,
    string? Alias,
    Guid LedgerGroupId,
    string LedgerGroupName,
    string LedgerGroupNature,
    Guid? DefaultCurrencyId,
    string? DefaultCurrencyCode,
    string Status,
    bool IsSystem,
    bool AllowManualPosting,
    bool IsBillWise,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc)
{
    public static LedgerDto FromEntity(Ledger ledger)
    {
        return new LedgerDto(
            ledger.Id,
            ledger.Code,
            ledger.Name,
            ledger.Alias,
            ledger.LedgerGroupId,
            ledger.LedgerGroup?.Name ?? string.Empty,
            ledger.LedgerGroup?.Nature ?? string.Empty,
            ledger.DefaultCurrencyId,
            ledger.DefaultCurrency?.Code,
            ledger.Status,
            ledger.IsSystem,
            ledger.AllowManualPosting,
            ledger.IsBillWise,
            ledger.CreatedAtUtc,
            ledger.UpdatedAtUtc);
    }
}
