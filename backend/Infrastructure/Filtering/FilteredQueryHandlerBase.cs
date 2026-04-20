using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Filtering;

public abstract class FilteredQueryHandlerBase<TEntity, TListItem, TFilter>
    where TEntity : class
    where TFilter : PagedFilter
{
    protected FilteredQueryHandlerBase(AppDbContext dbContext)
    {
        DbContext = dbContext;
    }

    protected AppDbContext DbContext { get; }

    public virtual async Task<PagedResponse<TListItem>> HandleAsync(TFilter filter, CancellationToken cancellationToken)
    {
        var page = filter.GetNormalizedPage();
        var limit = filter.GetNormalizedLimit();

        var query = BuildBaseQuery().AsNoTracking();
        query = ApplyKeyword(query, filter);
        query = ApplyFilters(query, filter);

        var total = await query.CountAsync(cancellationToken);
        var sortedQuery = ApplySorting(query, filter);
        var pagedQuery = sortedQuery
            .Skip((page - 1) * limit)
            .Take(limit);

        var items = await Project(pagedQuery).ToListAsync(cancellationToken);
        return PagedResponse<TListItem>.Create(items, page, limit, total, filter.SortBy, filter.Keyword);
    }

    protected abstract IQueryable<TEntity> BuildBaseQuery();

    protected virtual IQueryable<TEntity> ApplyKeyword(IQueryable<TEntity> query, TFilter filter) => query;

    protected virtual IQueryable<TEntity> ApplyFilters(IQueryable<TEntity> query, TFilter filter) => query;

    protected abstract IQueryable<TEntity> ApplySorting(IQueryable<TEntity> query, TFilter filter);

    protected abstract IQueryable<TListItem> Project(IQueryable<TEntity> query);
}
