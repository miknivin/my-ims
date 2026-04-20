namespace backend.Features.Masters.Warehouses;

public sealed record CreateWarehouseRequest(
    string Code,
    string Name,
    string? ContactPerson,
    string? Phone,
    string? Email,
    string? Address,
    string? Status);

public sealed record UpdateWarehouseRequest(
    string Code,
    string Name,
    string? ContactPerson,
    string? Phone,
    string? Email,
    string? Address,
    string? Status);
