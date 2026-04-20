namespace backend.Infrastructure.Filtering;

public sealed record PagedResponse<T>(
    IReadOnlyList<T> Items,
    int Page,
    int Limit,
    int Total,
    int TotalPages,
    string? SortBy,
    string? Keyword)
{
    public static PagedResponse<T> Create(
        IReadOnlyList<T> items,
        int page,
        int limit,
        int total,
        string? sortBy,
        string? keyword)
    {
        var totalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)limit);
        return new PagedResponse<T>(items, page, limit, total, totalPages, sortBy, keyword);
    }
}
