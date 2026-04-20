using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Discounts;

public static class DiscountEndpoints
{
    public static IEndpointRouteBuilder MapDiscountEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/discounts").WithTags("Discount Masters");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPut("/{id:guid}", UpdateAsync);
        group.MapDelete("/{id:guid}", DeleteAsync);

        return app;
    }

    private static async Task<IResult> GetAllAsync(
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var discounts = await dbContext.Discounts
            .OrderBy(discount => discount.Name)
            .Select(discount => DiscountDto.FromEntity(discount))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<DiscountDto>>(
            true,
            "Discount list fetched successfully.",
            discounts));
    }

    private static async Task<IResult> GetByIdAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var discount = await dbContext.Discounts
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return discount is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Discount not found.", null))
            : TypedResults.Ok(new ApiResponse<DiscountDto>(
                true,
                "Discount fetched successfully.",
                DiscountDto.FromEntity(discount)));
    }

    private static async Task<IResult> CreateAsync(
        CreateDiscountRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildDiscountRequest(
            request.Code,
            request.Name,
            request.Description,
            request.Type,
            request.Value,
            request.Status);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.Discounts.AnyAsync(
                discount => discount.Code == buildResult.Code || discount.Name == buildResult.Name,
                cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Discount with this code or name already exists.", null));
        }

        var now = DateTime.UtcNow;
        var discount = new Discount
        {
            Code = buildResult.Code,
            Name = buildResult.Name,
            Description = buildResult.Description,
            Type = buildResult.Type,
            Value = buildResult.Value,
            Status = buildResult.Status,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.Discounts.Add(discount);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Created($"/api/masters/discounts/{discount.Id}", new ApiResponse<DiscountDto>(
            true,
            "Discount created successfully.",
            DiscountDto.FromEntity(discount)));
    }

    private static async Task<IResult> UpdateAsync(
        Guid id,
        UpdateDiscountRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildDiscountRequest(
            request.Code,
            request.Name,
            request.Description,
            request.Type,
            request.Value,
            request.Status);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        var discount = await dbContext.Discounts.FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (discount is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Discount not found.", null));
        }

        if (await dbContext.Discounts.AnyAsync(
                current => current.Id != id && (current.Code == buildResult.Code || current.Name == buildResult.Name),
                cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Discount with this code or name already exists.", null));
        }

        discount.Code = buildResult.Code;
        discount.Name = buildResult.Name;
        discount.Description = buildResult.Description;
        discount.Type = buildResult.Type;
        discount.Value = buildResult.Value;
        discount.Status = buildResult.Status;
        discount.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<DiscountDto>(
            true,
            "Discount updated successfully.",
            DiscountDto.FromEntity(discount)));
    }

    private static async Task<IResult> DeleteAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var discount = await dbContext.Discounts.FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (discount is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Discount not found.", null));
        }

        dbContext.Discounts.Remove(discount);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Discount deleted successfully.", null));
    }

    private static DiscountRequestBuildResult BuildDiscountRequest(
        string? code,
        string? name,
        string? description,
        string? type,
        decimal value,
        string? status)
    {
        var normalizedCode = code?.Trim().ToUpperInvariant() ?? string.Empty;
        var normalizedName = name?.Trim() ?? string.Empty;
        var normalizedDescription = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        var normalizedType = type?.Trim().ToLowerInvariant() ?? string.Empty;
        var normalizedStatus = string.IsNullOrWhiteSpace(status) ? DiscountStatuses.Active : status.Trim();

        if (string.IsNullOrWhiteSpace(normalizedCode))
        {
            return new DiscountRequestBuildResult("Discount code is required.");
        }

        if (normalizedCode.Length is < 2 or > 20)
        {
            return new DiscountRequestBuildResult("Discount code must be between 2 and 20 characters.");
        }

        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return new DiscountRequestBuildResult("Discount name is required.");
        }

        if (normalizedName.Length is < 3 or > 120)
        {
            return new DiscountRequestBuildResult("Discount name must be between 3 and 120 characters.");
        }

        if (normalizedDescription is not null && normalizedDescription.Length > 300)
        {
            return new DiscountRequestBuildResult("Discount description cannot exceed 300 characters.");
        }

        if (!DiscountTypes.All.Contains(normalizedType, StringComparer.OrdinalIgnoreCase))
        {
            return new DiscountRequestBuildResult("Discount type must be percentage or fixed.");
        }

        if (value < 0)
        {
            return new DiscountRequestBuildResult("Discount value cannot be negative.");
        }

        if (normalizedType == DiscountTypes.Percentage && value > 100)
        {
            return new DiscountRequestBuildResult("Percentage discount cannot exceed 100.");
        }

        if (!DiscountStatuses.All.Contains(normalizedStatus, StringComparer.OrdinalIgnoreCase))
        {
            return new DiscountRequestBuildResult("Status must be either Active or Inactive.");
        }

        normalizedType = DiscountTypes.All.First(current => current.Equals(normalizedType, StringComparison.OrdinalIgnoreCase));
        normalizedStatus = DiscountStatuses.All.First(current => current.Equals(normalizedStatus, StringComparison.OrdinalIgnoreCase));

        return new DiscountRequestBuildResult(
            null,
            normalizedCode,
            normalizedName,
            normalizedDescription,
            normalizedType,
            value,
            normalizedStatus);
    }

    private sealed record DiscountRequestBuildResult(
        string? Error,
        string Code = "",
        string Name = "",
        string? Description = null,
        string Type = "",
        decimal Value = 0,
        string Status = "");
}
