namespace backend.Features.Masters.Uoms;

public sealed record UomDto(
    Guid Id,
    string Code,
    string Name,
    string Status,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc)
{
    public static UomDto FromEntity(Uom uom)
    {
        return new UomDto(
            uom.Id,
            uom.Code,
            uom.Name,
            uom.Status,
            uom.CreatedAtUtc,
            uom.UpdatedAtUtc);
    }
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
