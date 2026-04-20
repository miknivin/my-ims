namespace backend.Features.Masters.Ledgers;

public static class LedgerGroupStatuses
{
    public const string Active = "Active";
    public const string Inactive = "Inactive";

    public static readonly string[] All = [Active, Inactive];
}

public static class LedgerGroupNatures
{
    public const string Asset = "Asset";
    public const string Liability = "Liability";
    public const string Income = "Income";
    public const string Expense = "Expense";
    public const string Equity = "Equity";

    public static readonly string[] All = [Asset, Liability, Income, Expense, Equity];
}

public sealed class LedgerGroup
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Nature { get; set; } = LedgerGroupNatures.Asset;

    public Guid? ParentGroupId { get; set; }

    public LedgerGroup? ParentGroup { get; set; }

    public List<LedgerGroup> ChildGroups { get; set; } = [];

    public List<Ledger> Ledgers { get; set; } = [];

    public string Status { get; set; } = LedgerGroupStatuses.Active;

    public bool IsSystem { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
