using backend.Infrastructure.Filtering;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Customers;

public sealed class CustomerFilterRequest : PagedFilter
{
    public string? Status { get; set; }

    public string? CustomerType { get; set; }

    public string? PriceLevel { get; set; }

    public Guid? LedgerId { get; set; }

    public Guid? DefaultTaxId { get; set; }
}

public sealed record CustomerListItemDto(
    Guid Id,
    CustomerBasicDetailsDto BasicDetails,
    Guid? LedgerId,
    string? LedgerCode,
    string? LedgerName,
    CustomerContactDto Contact,
    CustomerFinancialsDto Financials,
    CustomerSalesAndPricingDto SalesAndPricing,
    string Status,
    CustomerOpeningBalanceDto? OpeningBalance,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);

public class CustomerSortRegistry : SortRegistryBase<Customer>
{
    protected override string DefaultSortKey => "name";

    public CustomerSortRegistry()
    {
        Register(
            "name",
            query => query.OrderBy(current => current.BasicDetails.Name).ThenBy(current => current.BasicDetails.Code),
            query => query.OrderByDescending(current => current.BasicDetails.Name).ThenByDescending(current => current.BasicDetails.Code));

        Register(
            "code",
            query => query.OrderBy(current => current.BasicDetails.Code),
            query => query.OrderByDescending(current => current.BasicDetails.Code));

        Register(
            "customerType",
            query => query.OrderBy(current => current.BasicDetails.CustomerType).ThenBy(current => current.BasicDetails.Name),
            query => query.OrderByDescending(current => current.BasicDetails.CustomerType).ThenByDescending(current => current.BasicDetails.Name));

        Register(
            "createdAt",
            query => query.OrderBy(current => current.CreatedAtUtc),
            query => query.OrderByDescending(current => current.CreatedAtUtc));
    }
}

public class GetCustomersQueryHandler : FilteredQueryHandlerBase<Customer, CustomerListItemDto, CustomerFilterRequest>
{
    private readonly CustomerSortRegistry _sortRegistry;

    public GetCustomersQueryHandler(AppDbContext dbContext, CustomerSortRegistry sortRegistry)
        : base(dbContext)
    {
        _sortRegistry = sortRegistry;
    }

    protected override IQueryable<Customer> BuildBaseQuery() => DbContext.Customers;

    protected override IQueryable<Customer> ApplyKeyword(IQueryable<Customer> query, CustomerFilterRequest filter)
    {
        if (string.IsNullOrWhiteSpace(filter.Keyword))
        {
            return query;
        }

        var pattern = $"%{filter.Keyword.Trim()}%";
        return query.Where(current =>
            EF.Functions.ILike(current.BasicDetails.Code, pattern) ||
            EF.Functions.ILike(current.BasicDetails.Name, pattern) ||
            (current.BasicDetails.Alias != null && EF.Functions.ILike(current.BasicDetails.Alias, pattern)) ||
            (current.Contact.Phone != null && EF.Functions.ILike(current.Contact.Phone, pattern)) ||
            (current.Contact.Mobile != null && EF.Functions.ILike(current.Contact.Mobile, pattern)) ||
            (current.Contact.Email != null && EF.Functions.ILike(current.Contact.Email, pattern)) ||
            (current.Ledger != null && (
                EF.Functions.ILike(current.Ledger.Name, pattern) ||
                EF.Functions.ILike(current.Ledger.Code, pattern))));
    }

    protected override IQueryable<Customer> ApplyFilters(IQueryable<Customer> query, CustomerFilterRequest filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            query = query.Where(current => current.Status == filter.Status);
        }

        if (!string.IsNullOrWhiteSpace(filter.CustomerType))
        {
            query = query.Where(current => current.BasicDetails.CustomerType == filter.CustomerType);
        }

        if (!string.IsNullOrWhiteSpace(filter.PriceLevel))
        {
            query = query.Where(current => current.SalesAndPricing.PriceLevel == filter.PriceLevel);
        }

        if (filter.LedgerId is not null)
        {
            query = query.Where(current => current.LedgerId == filter.LedgerId);
        }

        if (filter.DefaultTaxId is not null)
        {
            query = query.Where(current => current.SalesAndPricing.DefaultTaxId == filter.DefaultTaxId);
        }

        return query;
    }

    protected override IQueryable<Customer> ApplySorting(IQueryable<Customer> query, CustomerFilterRequest filter) =>
        _sortRegistry.Apply(query, filter.SortBy);

    protected override IQueryable<CustomerListItemDto> Project(IQueryable<Customer> query)
    {
        return query.Select(current => new CustomerListItemDto(
            current.Id,
            new CustomerBasicDetailsDto(
                current.BasicDetails.Code,
                current.BasicDetails.Name,
                current.BasicDetails.Alias,
                current.BasicDetails.CustomerType,
                current.BasicDetails.Category),
            current.LedgerId,
            current.Ledger != null ? current.Ledger.Code : null,
            current.Ledger != null ? current.Ledger.Name : null,
            new CustomerContactDto(
                current.Contact.Phone,
                current.Contact.Mobile,
                current.Contact.Email,
                current.Contact.Website),
            new CustomerFinancialsDto(
                current.Financials.CreditLimit,
                current.Financials.CreditDays),
            new CustomerSalesAndPricingDto(
                current.SalesAndPricing.DefaultTaxId,
                current.SalesAndPricing.DefaultTax != null ? current.SalesAndPricing.DefaultTax.Name : null,
                current.SalesAndPricing.PriceLevel),
            current.Status,
            current.OpeningBalance == null
                ? null
                : new CustomerOpeningBalanceDto(
                    current.OpeningBalance.Amount,
                    current.OpeningBalance.BalanceType,
                    current.OpeningBalance.AsOfDate),
            current.CreatedAtUtc,
            current.UpdatedAtUtc));
    }
}
