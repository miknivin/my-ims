namespace backend.Features.Masters.Taxes;

public sealed record TaxSlabDto(
    Guid Id,
    decimal FromAmount,
    decimal ToAmount,
    decimal Rate)
{
    public static TaxSlabDto FromEntity(TaxSlab slab)
    {
        return new TaxSlabDto(
            slab.Id,
            slab.FromAmount,
            slab.ToAmount,
            slab.Rate);
    }
}

public sealed record TaxDto(
    Guid Id,
    string Name,
    string Code,
    string Description,
    string Type,
    decimal? Rate,
    IReadOnlyList<TaxSlabDto> Slabs,
    string Status,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc)
{
    public static TaxDto FromEntity(Tax tax)
    {
        return new TaxDto(
            tax.Id,
            tax.Name,
            tax.Code,
            tax.Description,
            tax.Type,
            tax.Rate,
            tax.Slabs
                .OrderBy(slab => slab.FromAmount)
                .ThenBy(slab => slab.ToAmount)
                .Select(TaxSlabDto.FromEntity)
                .ToList(),
            tax.Status,
            tax.CreatedAtUtc,
            tax.UpdatedAtUtc);
    }
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
