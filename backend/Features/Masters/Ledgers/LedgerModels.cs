using backend.Features.Masters.Currencies;

namespace backend.Features.Masters.Ledgers;

public static class LedgerStatuses
{
    public const string Active = "Active";
    public const string Inactive = "Inactive";

    public static readonly string[] All = [Active, Inactive];
}

public sealed class Ledger
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Alias { get; set; }

    public Guid LedgerGroupId { get; set; }

    public LedgerGroup? LedgerGroup { get; set; }

    public Guid? DefaultCurrencyId { get; set; }

    public Currency? DefaultCurrency { get; set; }

    public string Status { get; set; } = LedgerStatuses.Active;

    public bool IsSystem { get; set; }

    public bool AllowManualPosting { get; set; } = true;

    public bool IsBillWise { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
