using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Uoms;

public static class UomEndpoints
{
    public static IEndpointRouteBuilder MapUomEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/uoms").WithTags("UOM Masters");

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
        var query = dbContext.Uoms.AsNoTracking();
        var normalizedKeyword = keyword?.Trim();
        if (!string.IsNullOrWhiteSpace(normalizedKeyword))
        {
            var pattern = $"%{normalizedKeyword}%";
            query = query.Where(uom =>
                EF.Functions.ILike(uom.Name, pattern) ||
                EF.Functions.ILike(uom.Code, pattern));
        }

        var normalizedLimit = limit is > 0 ? Math.Min(limit.Value, 100) : 0;
        var sortedQuery = query
            .OrderBy(uom => uom.Name)
            .Select(uom => UomDto.FromEntity(uom));

        var uoms = normalizedLimit > 0
            ? await sortedQuery.Take(normalizedLimit).ToListAsync(cancellationToken)
            : await sortedQuery.ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<UomDto>>(
            true,
            "UOM list fetched successfully.",
            uoms));
    }

    private static async Task<IResult> GetByIdAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var uom = await dbContext.Uoms
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return uom is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "UOM not found.", null))
            : TypedResults.Ok(new ApiResponse<UomDto>(
                true,
                "UOM fetched successfully.",
                UomDto.FromEntity(uom)));
    }

    private static async Task<IResult> CreateAsync(
        CreateUomRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildUomRequest(request.Code, request.Name, request.Status);
        if (!buildResult.IsValid)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error!, null));
        }

        if (await dbContext.Uoms.AnyAsync(uom => uom.Code == buildResult.Code, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "UOM code already exists.", null));
        }

        var now = DateTime.UtcNow;
        var uom = new Uom
        {
            Code = buildResult.Code,
            Name = buildResult.Name,
            Status = buildResult.Status,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.Uoms.Add(uom);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Created($"/api/masters/uoms/{uom.Id}", new ApiResponse<UomDto>(
            true,
            "UOM created successfully.",
            UomDto.FromEntity(uom)));
    }

    private static async Task<IResult> UpdateAsync(
        Guid id,
        UpdateUomRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildUomRequest(request.Code, request.Name, request.Status);
        if (!buildResult.IsValid)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error!, null));
        }

        var uom = await dbContext.Uoms.FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (uom is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "UOM not found.", null));
        }

        var codeExists = await dbContext.Uoms.AnyAsync(
            current => current.Id != id && current.Code == buildResult.Code,
            cancellationToken);

        if (codeExists)
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "UOM code already exists.", null));
        }

        uom.Code = buildResult.Code;
        uom.Name = buildResult.Name;
        uom.Status = buildResult.Status;
        uom.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<UomDto>(
            true,
            "UOM updated successfully.",
            UomDto.FromEntity(uom)));
    }

    private static async Task<IResult> DeleteAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var uom = await dbContext.Uoms.FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (uom is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "UOM not found.", null));
        }

        dbContext.Uoms.Remove(uom);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "UOM deleted successfully.", null));
    }

    private static UomRequestBuildResult BuildUomRequest(
        string? code,
        string? name,
        string? status)
    {
        var normalizedCode = code?.Trim().ToUpperInvariant() ?? string.Empty;
        var normalizedName = name?.Trim() ?? string.Empty;
        var normalizedStatus = string.IsNullOrWhiteSpace(status) ? UomStatuses.Active : status.Trim();

        if (string.IsNullOrWhiteSpace(normalizedCode))
        {
            return UomRequestBuildResult.Invalid("UOM code is required.");
        }

        if (normalizedCode.Length > 10)
        {
            return UomRequestBuildResult.Invalid("UOM code cannot exceed 10 characters.");
        }

        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return UomRequestBuildResult.Invalid("UOM name is required.");
        }

        if (normalizedName.Length < 2)
        {
            return UomRequestBuildResult.Invalid("UOM name must be at least 2 characters.");
        }

        if (normalizedName.Length > 50)
        {
            return UomRequestBuildResult.Invalid("UOM name cannot exceed 50 characters.");
        }

        if (!UomStatuses.All.Contains(normalizedStatus, StringComparer.OrdinalIgnoreCase))
        {
            return UomRequestBuildResult.Invalid("Status must be either Active or Inactive.");
        }

        var requestedStatus = normalizedStatus;
        normalizedStatus = UomStatuses.All.First(value => value.Equals(requestedStatus, StringComparison.OrdinalIgnoreCase));
        return UomRequestBuildResult.Valid(normalizedCode, normalizedName, normalizedStatus);
    }

    private sealed record UomRequestBuildResult(
        bool IsValid,
        string? Error,
        string Code,
        string Name,
        string Status)
    {
        public static UomRequestBuildResult Valid(string code, string name, string status) =>
            new(true, null, code, name, status);

        public static UomRequestBuildResult Invalid(string error) =>
            new(false, error, string.Empty, string.Empty, string.Empty);
    }
}
