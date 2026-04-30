using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Warehouses;

public static class WarehouseEndpoints
{
    public static IEndpointRouteBuilder MapWarehouseEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/warehouses").WithTags("Warehouse Masters");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPut("/{id:guid}", UpdateAsync);
        group.MapDelete("/{id:guid}", DeleteAsync);

        return app;
    }

    private static async Task<IResult> GetAllAsync(
        string? keyword,
        int? limit,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Warehouses.AsNoTracking();
        var normalizedKeyword = keyword?.Trim();
        if (!string.IsNullOrWhiteSpace(normalizedKeyword))
        {
            var pattern = $"%{normalizedKeyword}%";
            query = query.Where(current =>
                EF.Functions.ILike(current.Name, pattern) ||
                EF.Functions.ILike(current.Code, pattern) ||
                (current.ContactPerson != null && EF.Functions.ILike(current.ContactPerson, pattern)));
        }

        var normalizedLimit = limit is > 0 ? Math.Min(limit.Value, 100) : 0;
        var sortedQuery = query
            .OrderBy(current => current.Name)
            .Select(current => WarehouseDto.FromEntity(current));

        var warehouses = normalizedLimit > 0
            ? await sortedQuery.Take(normalizedLimit).ToListAsync(cancellationToken)
            : await sortedQuery.ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<WarehouseDto>>(true, "Warehouse list fetched successfully.", warehouses));
    }

    private static async Task<IResult> GetByIdAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var warehouse = await dbContext.Warehouses.FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return warehouse is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Warehouse not found.", null))
            : TypedResults.Ok(new ApiResponse<WarehouseDto>(true, "Warehouse fetched successfully.", WarehouseDto.FromEntity(warehouse)));
    }

    private static async Task<IResult> CreateAsync(CreateWarehouseRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildWarehouseRequest(request.Code, request.Name, request.Status, request.ContactPerson, request.Phone, request.Email, request.Address);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.Warehouses.AnyAsync(current => current.Code == buildResult.Code || current.Name == buildResult.Name, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Warehouse with this code or name already exists.", null));
        }

        var now = DateTime.UtcNow;
        var warehouse = new Warehouse
        {
            Code = buildResult.Code,
            Name = buildResult.Name,
            ContactPerson = buildResult.ContactPerson,
            Phone = buildResult.Phone,
            Email = buildResult.Email,
            Address = buildResult.Address,
            Status = buildResult.Status,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.Warehouses.Add(warehouse);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Created($"/api/masters/warehouses/{warehouse.Id}", new ApiResponse<WarehouseDto>(true, "Warehouse created successfully.", WarehouseDto.FromEntity(warehouse)));
    }

    private static async Task<IResult> UpdateAsync(Guid id, UpdateWarehouseRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildWarehouseRequest(request.Code, request.Name, request.Status, request.ContactPerson, request.Phone, request.Email, request.Address);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        var warehouse = await dbContext.Warehouses.FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (warehouse is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Warehouse not found.", null));
        }

        if (await dbContext.Warehouses.AnyAsync(current => current.Id != id && (current.Code == buildResult.Code || current.Name == buildResult.Name), cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Warehouse with this code or name already exists.", null));
        }

        warehouse.Code = buildResult.Code;
        warehouse.Name = buildResult.Name;
        warehouse.ContactPerson = buildResult.ContactPerson;
        warehouse.Phone = buildResult.Phone;
        warehouse.Email = buildResult.Email;
        warehouse.Address = buildResult.Address;
        warehouse.Status = buildResult.Status;
        warehouse.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<WarehouseDto>(true, "Warehouse updated successfully.", WarehouseDto.FromEntity(warehouse)));
    }

    private static async Task<IResult> DeleteAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var warehouse = await dbContext.Warehouses.FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (warehouse is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Warehouse not found.", null));
        }

        dbContext.Warehouses.Remove(warehouse);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Warehouse deleted successfully.", null));
    }

    private static WarehouseRequestBuildResult BuildWarehouseRequest(
        string? code,
        string? name,
        string? status,
        string? contactPerson,
        string? phone,
        string? email,
        string? address)
    {
        var normalizedCode = code?.Trim().ToUpperInvariant() ?? string.Empty;
        var normalizedName = name?.Trim() ?? string.Empty;
        var normalizedStatus = string.IsNullOrWhiteSpace(status) ? WarehouseStatuses.Active : status.Trim();

        if (string.IsNullOrWhiteSpace(normalizedCode))
        {
            return new WarehouseRequestBuildResult("Warehouse code is required.");
        }

        if (normalizedCode.Length is < 2 or > 20)
        {
            return new WarehouseRequestBuildResult("Warehouse code must be between 2 and 20 characters.");
        }

        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return new WarehouseRequestBuildResult("Warehouse name is required.");
        }

        if (normalizedName.Length is < 3 or > 120)
        {
            return new WarehouseRequestBuildResult("Warehouse name must be between 3 and 120 characters.");
        }

        if (!WarehouseStatuses.All.Contains(normalizedStatus, StringComparer.OrdinalIgnoreCase))
        {
            return new WarehouseRequestBuildResult("Status must be either Active or Inactive.");
        }

        var requestedStatus = normalizedStatus;
        normalizedStatus = WarehouseStatuses.All.First(value => value.Equals(requestedStatus, StringComparison.OrdinalIgnoreCase));
        return new WarehouseRequestBuildResult(
            null,
            normalizedCode,
            normalizedName,
            normalizedStatus,
            NormalizeOptional(contactPerson),
            NormalizeOptional(phone),
            NormalizeOptional(email),
            NormalizeOptional(address));
    }

    private sealed record WarehouseRequestBuildResult(
        string? Error,
        string Code = "",
        string Name = "",
        string Status = "",
        string? ContactPerson = null,
        string? Phone = null,
        string? Email = null,
        string? Address = null);

    private static string? NormalizeOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
