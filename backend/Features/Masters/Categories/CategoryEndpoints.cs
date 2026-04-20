using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Categories;

public static class CategoryEndpoints
{
    public static IEndpointRouteBuilder MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/categories").WithTags("Category Masters");

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
        var categories = await dbContext.Categories
            .Include(category => category.ParentCategory)
            .OrderBy(category => category.Name)
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<CategoryDto>>(
            true,
            "Category list fetched successfully.",
            categories.Select(CategoryDto.FromEntity).ToList()));
    }

    private static async Task<IResult> GetByIdAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var category = await dbContext.Categories
            .Include(current => current.ParentCategory)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return category is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Category not found.", null))
            : TypedResults.Ok(new ApiResponse<CategoryDto>(
                true,
                "Category fetched successfully.",
                CategoryDto.FromEntity(category)));
    }

    private static async Task<IResult> CreateAsync(
        CreateCategoryRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildCategoryRequest(
            request.Code,
            request.Name,
            request.Status);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.Categories.AnyAsync(
                category => category.Code == buildResult.Code || category.Name == buildResult.Name,
                cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Category with this code or name already exists.", null));
        }

        var (parentCategory, referenceError) = await ResolveParentCategoryAsync(request.ParentCategoryId, dbContext, cancellationToken);
        if (referenceError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, referenceError, null));
        }

        var now = DateTime.UtcNow;
        var category = new Category
        {
            Code = buildResult.Code,
            Name = buildResult.Name,
            ParentCategoryId = request.ParentCategoryId,
            ParentCategory = parentCategory,
            Status = buildResult.Status,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.Categories.Add(category);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Created($"/api/masters/categories/{category.Id}", new ApiResponse<CategoryDto>(
            true,
            "Category created successfully.",
            CategoryDto.FromEntity(category)));
    }

    private static async Task<IResult> UpdateAsync(
        Guid id,
        UpdateCategoryRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildCategoryRequest(
            request.Code,
            request.Name,
            request.Status);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        var category = await dbContext.Categories
            .Include(current => current.ParentCategory)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        if (category is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Category not found.", null));
        }

        if (await dbContext.Categories.AnyAsync(
                current => current.Id != id && (current.Code == buildResult.Code || current.Name == buildResult.Name),
                cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Category with this code or name already exists.", null));
        }

        if (request.ParentCategoryId == id)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "A category cannot be its own parent.", null));
        }

        var (parentCategory, referenceError) = await ResolveParentCategoryAsync(request.ParentCategoryId, dbContext, cancellationToken);
        if (referenceError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, referenceError, null));
        }

        category.Code = buildResult.Code;
        category.Name = buildResult.Name;
        category.ParentCategoryId = request.ParentCategoryId;
        category.ParentCategory = parentCategory;
        category.Status = buildResult.Status;
        category.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<CategoryDto>(
            true,
            "Category updated successfully.",
            CategoryDto.FromEntity(category)));
    }

    private static async Task<IResult> DeleteAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var category = await dbContext.Categories.FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (category is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Category not found.", null));
        }

        var hasChildren = await dbContext.Categories.AnyAsync(
            current => current.ParentCategoryId == id,
            cancellationToken);

        if (hasChildren)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "Cannot delete a category that has child categories.", null));
        }

        dbContext.Categories.Remove(category);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Category deleted successfully.", null));
    }

    private static async Task<(Category? ParentCategory, string? Error)> ResolveParentCategoryAsync(
        Guid? parentCategoryId,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (parentCategoryId is null)
        {
            return (null, null);
        }

        var parentCategory = await dbContext.Categories.FirstOrDefaultAsync(
            current => current.Id == parentCategoryId.Value,
            cancellationToken);

        return parentCategory is null
            ? (null, "Selected parent category does not exist.")
            : (parentCategory, null);
    }

    private static CategoryRequestBuildResult BuildCategoryRequest(
        string? code,
        string? name,
        string? status)
    {
        var normalizedCode = code?.Trim().ToUpperInvariant() ?? string.Empty;
        var normalizedName = name?.Trim() ?? string.Empty;
        var normalizedStatus = string.IsNullOrWhiteSpace(status) ? CategoryStatuses.Active : status.Trim();

        if (string.IsNullOrWhiteSpace(normalizedCode))
        {
            return new CategoryRequestBuildResult("Category code is required.");
        }

        if (normalizedCode.Length < 3)
        {
            return new CategoryRequestBuildResult("Category code must be at least 3 characters.");
        }

        if (normalizedCode.Length > 10)
        {
            return new CategoryRequestBuildResult("Category code cannot exceed 10 characters.");
        }

        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return new CategoryRequestBuildResult("Category name is required.");
        }

        if (normalizedName.Length < 3)
        {
            return new CategoryRequestBuildResult("Category name must be at least 3 characters.");
        }

        if (normalizedName.Length > 50)
        {
            return new CategoryRequestBuildResult("Category name cannot exceed 50 characters.");
        }

        if (!CategoryStatuses.All.Contains(normalizedStatus, StringComparer.OrdinalIgnoreCase))
        {
            return new CategoryRequestBuildResult("Status must be either Active or Inactive.");
        }

        var requestedStatus = normalizedStatus;
        normalizedStatus = CategoryStatuses.All.First(value => value.Equals(requestedStatus, StringComparison.OrdinalIgnoreCase));
        return new CategoryRequestBuildResult(null, normalizedCode, normalizedName, normalizedStatus);
    }

    private sealed record CategoryRequestBuildResult(
        string? Error,
        string Code = "",
        string Name = "",
        string Status = "");
}
