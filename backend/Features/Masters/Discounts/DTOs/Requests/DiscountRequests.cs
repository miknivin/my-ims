namespace backend.Features.Masters.Discounts;

public sealed record CreateDiscountRequest(
    string Code,
    string Name,
    string? Description,
    string Type,
    decimal Value,
    string? Status);

public sealed record UpdateDiscountRequest(
    string Code,
    string Name,
    string? Description,
    string Type,
    decimal Value,
    string? Status);
