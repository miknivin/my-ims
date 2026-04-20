namespace backend.Infrastructure.Filtering;

public abstract class SortRegistryBase<TEntity>
{
    private readonly Dictionary<string, SortOption<TEntity>> _options = new(StringComparer.OrdinalIgnoreCase);

    protected abstract string DefaultSortKey { get; }

    protected void Register(
        string key,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> ascending,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> descending)
    {
        _options[key] = new SortOption<TEntity>(ascending, descending);
    }

    public virtual IQueryable<TEntity> Apply(IQueryable<TEntity> query, string? sortBy)
    {
        var requestedSort = string.IsNullOrWhiteSpace(sortBy) ? DefaultSortKey : sortBy.Trim();
        var isDescending = requestedSort.EndsWith("_desc", StringComparison.OrdinalIgnoreCase);
        var baseKey = isDescending
            ? requestedSort[..^5]
            : requestedSort;

        if (!_options.TryGetValue(baseKey, out var option))
        {
            option = _options[DefaultSortKey];
            isDescending = false;
        }

        return isDescending ? option.Descending(query) : option.Ascending(query);
    }
}
