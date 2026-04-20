namespace backend.Features.Masters.Discounts;

public static class DiscountTypes
{
    public const string Percentage = "percentage";
    public const string Fixed = "fixed";

    public static readonly string[] All = [Percentage, Fixed];
}

public static class DiscountStatuses
{
    public const string Active = "Active";
    public const string Inactive = "Inactive";

    public static readonly string[] All = [Active, Inactive];
}

public sealed class Discount
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string Type { get; set; } = DiscountTypes.Percentage;

    public decimal Value { get; set; }

    public string Status { get; set; } = DiscountStatuses.Active;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
