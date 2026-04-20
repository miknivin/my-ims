namespace backend.Features.Masters.Discounts;

public sealed record DiscountDto(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    string Type,
    decimal Value,
    string Status,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc)
{
    public static DiscountDto FromEntity(Discount discount)
    {
        return new DiscountDto(
            discount.Id,
            discount.Code,
            discount.Name,
            discount.Description,
            discount.Type,
            discount.Value,
            discount.Status,
            discount.CreatedAtUtc,
            discount.UpdatedAtUtc);
    }
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
