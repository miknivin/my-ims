namespace backend.Features.Masters.Categories;

public sealed record CreateCategoryRequest(
    string Code,
    string Name,
    Guid? ParentCategoryId,
    string? Status);

public sealed record UpdateCategoryRequest(
    string Code,
    string Name,
    Guid? ParentCategoryId,
    string? Status);
