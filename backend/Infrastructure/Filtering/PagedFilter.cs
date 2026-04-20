namespace backend.Infrastructure.Filtering;

public abstract class PagedFilter
{
    public string? Keyword { get; set; }

    public int Page { get; set; } = 1;

    public int Limit { get; set; } = 20;

    public string? SortBy { get; set; }

    public int GetNormalizedPage() => Page < 1 ? 1 : Page;

    public int GetNormalizedLimit(int defaultLimit = 20, int maxLimit = 100)
    {
        if (Limit <= 0)
        {
            return defaultLimit;
        }

        return Limit > maxLimit ? maxLimit : Limit;
    }
}
