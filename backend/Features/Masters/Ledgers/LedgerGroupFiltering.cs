using backend.Infrastructure.Filtering;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Ledgers;

public sealed class LedgerGroupFilterRequest : PagedFilter
{
    public string? Nature { get; set; }

    public string? Status { get; set; }
}

public class LedgerGroupSortRegistry : SortRegistryBase<LedgerGroup>
{
    protected override string DefaultSortKey => "name";

    public LedgerGroupSortRegistry()
    {
        Register(
            "name",
            query => query.OrderBy(g => g.Name),
            query => query.OrderByDescending(g => g.Name));

        Register(
            "code",
            query => query.OrderBy(g => g.Code),
            query => query.OrderByDescending(g => g.Code));

        Register(
            "nature",
            query => query.OrderBy(g => g.Nature).ThenBy(g => g.Name),
            query => query.OrderByDescending(g => g.Nature).ThenByDescending(g => g.Name));
    }
}

public class GetLedgerGroupsQueryHandler : FilteredQueryHandlerBase<LedgerGroup, LedgerGroupDto, LedgerGroupFilterRequest>
{
    private readonly LedgerGroupSortRegistry _sortRegistry;

    public GetLedgerGroupsQueryHandler(AppDbContext dbContext, LedgerGroupSortRegistry sortRegistry)
        : base(dbContext)
    {
        _sortRegistry = sortRegistry;
    }

    protected override IQueryable<LedgerGroup> BuildBaseQuery() =>
        DbContext.LedgerGroups.Include(g => g.ParentGroup);

    protected override IQueryable<LedgerGroup> ApplyKeyword(IQueryable<LedgerGroup> query, LedgerGroupFilterRequest filter)
    {
        if (string.IsNullOrWhiteSpace(filter.Keyword))
        {
            return query;
        }

        var pattern = $"%{filter.Keyword.Trim()}%";
        return query.Where(g =>
            EF.Functions.ILike(g.Code, pattern) ||
            EF.Functions.ILike(g.Name, pattern));
    }

    protected override IQueryable<LedgerGroup> ApplyFilters(IQueryable<LedgerGroup> query, LedgerGroupFilterRequest filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Nature))
        {
            query = query.Where(g => g.Nature == filter.Nature);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            query = query.Where(g => g.Status == filter.Status);
        }

        return query;
    }

    protected override IQueryable<LedgerGroup> ApplySorting(IQueryable<LedgerGroup> query, LedgerGroupFilterRequest filter) =>
        _sortRegistry.Apply(query, filter.SortBy);

    protected override IQueryable<LedgerGroupDto> Project(IQueryable<LedgerGroup> query) =>
        query.Select(g => new LedgerGroupDto(
            g.Id,
            g.Code,
            g.Name,
            g.Nature,
            g.ParentGroupId,
            g.ParentGroup != null ? g.ParentGroup.Name : null,
            g.Status,
            g.IsSystem,
            g.CreatedAtUtc,
            g.UpdatedAtUtc));
}
