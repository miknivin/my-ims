using backend.Infrastructure.Filtering;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Vendors;

public sealed class VendorFilterRequest : PagedFilter
{
    public string? Status { get; set; }

    public Guid? LedgerId { get; set; }

    public Guid? CurrencyId { get; set; }
}

public sealed record VendorListItemDto(
    Guid Id,
    VendorBasicInfoDto BasicInfo,
    string? ContactName,
    string Phone,
    Guid? CurrencyId,
    string? CurrencyCode,
    Guid? LedgerId,
    string? LedgerCode,
    string? LedgerName,
    string Status,
    VendorOpeningBalanceDto? OpeningBalance,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);

public class VendorSortRegistry : SortRegistryBase<Vendor>
{
    protected override string DefaultSortKey => "name";

    public VendorSortRegistry()
    {
        Register(
            "name",
            query => query.OrderBy(current => current.BasicInfo.Name).ThenBy(current => current.BasicInfo.Code),
            query => query.OrderByDescending(current => current.BasicInfo.Name).ThenByDescending(current => current.BasicInfo.Code));

        Register(
            "code",
            query => query.OrderBy(current => current.BasicInfo.Code),
            query => query.OrderByDescending(current => current.BasicInfo.Code));

        Register(
            "status",
            query => query.OrderBy(current => current.Status).ThenBy(current => current.BasicInfo.Name),
            query => query.OrderByDescending(current => current.Status).ThenByDescending(current => current.BasicInfo.Name));

        Register(
            "createdAt",
            query => query.OrderBy(current => current.CreatedAtUtc),
            query => query.OrderByDescending(current => current.CreatedAtUtc));
    }
}

public class GetVendorsQueryHandler : FilteredQueryHandlerBase<Vendor, VendorListItemDto, VendorFilterRequest>
{
    private readonly VendorSortRegistry _sortRegistry;

    public GetVendorsQueryHandler(AppDbContext dbContext, VendorSortRegistry sortRegistry)
        : base(dbContext)
    {
        _sortRegistry = sortRegistry;
    }

    protected override IQueryable<Vendor> BuildBaseQuery() => DbContext.Vendors;

    protected override IQueryable<Vendor> ApplyKeyword(IQueryable<Vendor> query, VendorFilterRequest filter)
    {
        if (string.IsNullOrWhiteSpace(filter.Keyword))
        {
            return query;
        }

        var pattern = $"%{filter.Keyword.Trim()}%";
        return query.Where(current =>
            EF.Functions.ILike(current.BasicInfo.Code, pattern) ||
            EF.Functions.ILike(current.BasicInfo.Name, pattern) ||
            (current.AddressAndContact.ContactName != null && EF.Functions.ILike(current.AddressAndContact.ContactName, pattern)) ||
            EF.Functions.ILike(current.AddressAndContact.Phone, pattern) ||
            EF.Functions.ILike(current.AddressAndContact.Email, pattern) ||
            (current.Ledger != null && (
                EF.Functions.ILike(current.Ledger.Name, pattern) ||
                EF.Functions.ILike(current.Ledger.Code, pattern))));
    }

    protected override IQueryable<Vendor> ApplyFilters(IQueryable<Vendor> query, VendorFilterRequest filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            query = query.Where(current => current.Status == filter.Status);
        }

        if (filter.LedgerId is not null)
        {
            query = query.Where(current => current.LedgerId == filter.LedgerId);
        }

        if (filter.CurrencyId is not null)
        {
            query = query.Where(current => current.CreditAndFinance.CurrencyId == filter.CurrencyId);
        }

        return query;
    }

    protected override IQueryable<Vendor> ApplySorting(IQueryable<Vendor> query, VendorFilterRequest filter) =>
        _sortRegistry.Apply(query, filter.SortBy);

    protected override IQueryable<VendorListItemDto> Project(IQueryable<Vendor> query)
    {
        return query.Select(current => new VendorListItemDto(
            current.Id,
            new VendorBasicInfoDto(
                current.BasicInfo.Code,
                current.BasicInfo.Name,
                current.BasicInfo.Under),
            current.AddressAndContact.ContactName,
            current.AddressAndContact.Phone,
            current.CreditAndFinance.CurrencyId,
            current.CreditAndFinance.Currency != null ? current.CreditAndFinance.Currency.Code : null,
            current.LedgerId,
            current.Ledger != null ? current.Ledger.Code : null,
            current.Ledger != null ? current.Ledger.Name : null,
            current.Status,
            current.OpeningBalance == null
                ? null
                : new VendorOpeningBalanceDto(
                    current.OpeningBalance.Amount,
                    current.OpeningBalance.BalanceType,
                    current.OpeningBalance.AsOfDate),
            current.CreatedAtUtc,
            current.UpdatedAtUtc));
    }
}
