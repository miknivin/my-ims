namespace backend.Infrastructure.Filtering;

public sealed record SortOption<TEntity>(
    Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> Ascending,
    Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> Descending);
