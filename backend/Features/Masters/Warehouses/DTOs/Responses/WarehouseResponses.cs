namespace backend.Features.Masters.Warehouses;

public sealed record WarehouseDto(
    Guid Id,
    string Code,
    string Name,
    string? ContactPerson,
    string? Phone,
    string? Email,
    string? Address,
    string Status,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc)
{
    public static WarehouseDto FromEntity(Warehouse warehouse)
    {
        return new WarehouseDto(
            warehouse.Id,
            warehouse.Code,
            warehouse.Name,
            warehouse.ContactPerson,
            warehouse.Phone,
            warehouse.Email,
            warehouse.Address,
            warehouse.Status,
            warehouse.CreatedAtUtc,
            warehouse.UpdatedAtUtc);
    }
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
