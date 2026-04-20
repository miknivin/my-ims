namespace backend.Features.Masters.Taxes;

public sealed record TaxSlabRequest(
    decimal FromAmount,
    decimal ToAmount,
    decimal Rate);

public sealed record CreateTaxRequest(
    string Name,
    string Code,
    string? Description,
    string Type,
    decimal? Rate,
    IReadOnlyList<TaxSlabRequest>? Slabs,
    string? Status);

public sealed record UpdateTaxRequest(
    string Name,
    string Code,
    string? Description,
    string Type,
    decimal? Rate,
    IReadOnlyList<TaxSlabRequest>? Slabs,
    string? Status);
