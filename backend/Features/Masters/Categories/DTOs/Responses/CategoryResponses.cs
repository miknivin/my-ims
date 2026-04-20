namespace backend.Features.Masters.Categories;

public sealed record CategoryDto(
    Guid Id,
    string Code,
    string Name,
    Guid? ParentCategoryId,
    string? ParentCategoryName,
    string Status,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc)
{
    public static CategoryDto FromEntity(Category category)
    {
        return new CategoryDto(
            category.Id,
            category.Code,
            category.Name,
            category.ParentCategoryId,
            category.ParentCategory?.Name,
            category.Status,
            category.CreatedAtUtc,
            category.UpdatedAtUtc);
    }
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
