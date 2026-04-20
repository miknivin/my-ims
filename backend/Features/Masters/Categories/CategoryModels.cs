namespace backend.Features.Masters.Categories;

public static class CategoryStatuses
{
    public const string Active = "Active";
    public const string Inactive = "Inactive";

    public static readonly string[] All = [Active, Inactive];
}

public sealed class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public Guid? ParentCategoryId { get; set; }

    public Category? ParentCategory { get; set; }

    public List<Category> ChildCategories { get; set; } = [];

    public string Status { get; set; } = CategoryStatuses.Active;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
