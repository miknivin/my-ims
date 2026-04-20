namespace backend.Features.Masters.Taxes;

public static class TaxTypes
{
    public const string Percentage = "percentage";
    public const string Fixed = "fixed";
    public const string Slab = "slab";

    public static readonly string[] All = [Percentage, Fixed, Slab];
}

public static class TaxStatuses
{
    public const string Active = "Active";
    public const string Inactive = "Inactive";
    public const string Draft = "Draft";

    public static readonly string[] All = [Active, Inactive, Draft];
}

public sealed class Tax
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string Code { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Type { get; set; } = TaxTypes.Percentage;

    public decimal? Rate { get; set; }

    public List<TaxSlab> Slabs { get; set; } = [];

    public string Status { get; set; } = TaxStatuses.Active;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class TaxSlab
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TaxId { get; set; }

    public Tax Tax { get; set; } = null!;

    public decimal FromAmount { get; set; }

    public decimal ToAmount { get; set; }

    public decimal Rate { get; set; }
}
