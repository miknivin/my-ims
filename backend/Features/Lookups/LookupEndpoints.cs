using backend.Features.Masters.Categories;
using backend.Features.Masters.Customers;
using backend.Features.Masters.Currencies;
using backend.Features.Masters.Taxes;
using backend.Features.Masters.Uoms;
using backend.Features.Masters.Vendors;
using backend.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Lookups;

public static class LookupSources
{
    public const string Ledgers = "ledgers";
    public const string Currencies = "currencies";
    public const string Taxes = "taxes";
    public const string Categories = "categories";
    public const string Customers = "customers";
    public const string Vendors = "vendors";
    public const string Uoms = "uoms";
}

public sealed record LookupOptionDto(
    Guid Id,
    string Label,
    string? SecondaryLabel);

public sealed class LookupSearchRequest
{
    public string? Keyword { get; set; }

    public int Limit { get; set; } = 10;
}

public sealed record LookupResolveItemRequest(
    string Source,
    IReadOnlyList<Guid> Ids);

public sealed record LookupResolveRequest(
    IReadOnlyList<LookupResolveItemRequest> Items);

public sealed record LookupResolveItemResponse(
    string Source,
    IReadOnlyList<LookupOptionDto> Options);

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);

public static class LookupEndpoints
{
    public static IEndpointRouteBuilder MapLookupEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/lookups").WithTags("Lookups");

        group.MapGet("/{source}", SearchAsync);
        group.MapPost("/resolve", ResolveAsync);

        return app;
    }

    private static async Task<IResult> SearchAsync(
        string source,
        [AsParameters] LookupSearchRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var limit = request.Limit <= 0 ? 10 : Math.Min(request.Limit, 25);
        var keyword = request.Keyword?.Trim();

        var options = source.ToLowerInvariant() switch
        {
            LookupSources.Ledgers => await SearchLedgersAsync(dbContext, keyword, limit, cancellationToken),
            LookupSources.Currencies => await SearchCurrenciesAsync(dbContext, keyword, limit, cancellationToken),
            LookupSources.Taxes => await SearchTaxesAsync(dbContext, keyword, limit, cancellationToken),
            LookupSources.Categories => await SearchCategoriesAsync(dbContext, keyword, limit, cancellationToken),
            LookupSources.Customers => await SearchCustomersAsync(dbContext, keyword, limit, cancellationToken),
            LookupSources.Vendors => await SearchVendorsAsync(dbContext, keyword, limit, cancellationToken),
            LookupSources.Uoms => await SearchUomsAsync(dbContext, keyword, limit, cancellationToken),
            _ => null
        };

        return options is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Lookup source not found.", null))
            : TypedResults.Ok(new ApiResponse<IReadOnlyList<LookupOptionDto>>(
                true,
                "Lookup options fetched successfully.",
                options));
    }

    private static async Task<IResult> ResolveAsync(
        LookupResolveRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var results = new List<LookupResolveItemResponse>();

        foreach (var item in request.Items.Where(current => current.Ids.Count > 0))
        {
            var options = item.Source.ToLowerInvariant() switch
            {
                LookupSources.Ledgers => await ResolveLedgersAsync(dbContext, item.Ids, cancellationToken),
                LookupSources.Currencies => await ResolveCurrenciesAsync(dbContext, item.Ids, cancellationToken),
                LookupSources.Taxes => await ResolveTaxesAsync(dbContext, item.Ids, cancellationToken),
                LookupSources.Categories => await ResolveCategoriesAsync(dbContext, item.Ids, cancellationToken),
                LookupSources.Customers => await ResolveCustomersAsync(dbContext, item.Ids, cancellationToken),
                LookupSources.Vendors => await ResolveVendorsAsync(dbContext, item.Ids, cancellationToken),
                LookupSources.Uoms => await ResolveUomsAsync(dbContext, item.Ids, cancellationToken),
                _ => []
            };

            results.Add(new LookupResolveItemResponse(item.Source, options));
        }

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<LookupResolveItemResponse>>(
            true,
            "Lookup values resolved successfully.",
            results));
    }

    private static async Task<IReadOnlyList<LookupOptionDto>> SearchLedgersAsync(
        AppDbContext dbContext,
        string? keyword,
        int limit,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Ledgers.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var pattern = $"%{keyword}%";
            query = query.Where(current =>
                EF.Functions.ILike(current.Name, pattern) ||
                EF.Functions.ILike(current.Code, pattern));
        }

        return await query
            .OrderBy(current => current.Name)
            .Take(limit)
            .Select(current => new LookupOptionDto(current.Id, current.Name, current.Code))
            .ToListAsync(cancellationToken);
    }

    private static async Task<IReadOnlyList<LookupOptionDto>> SearchCurrenciesAsync(
        AppDbContext dbContext,
        string? keyword,
        int limit,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Currencies.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var pattern = $"%{keyword}%";
            query = query.Where(current =>
                EF.Functions.ILike(current.Name, pattern) ||
                EF.Functions.ILike(current.Code, pattern) ||
                EF.Functions.ILike(current.Symbol, pattern));
        }

        return await query
            .OrderBy(current => current.Name)
            .Take(limit)
            .Select(current => new LookupOptionDto(current.Id, current.Name, $"{current.Code} {current.Symbol}".Trim()))
            .ToListAsync(cancellationToken);
    }

    private static async Task<IReadOnlyList<LookupOptionDto>> SearchTaxesAsync(
        AppDbContext dbContext,
        string? keyword,
        int limit,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Taxes.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var pattern = $"%{keyword}%";
            query = query.Where(current =>
                EF.Functions.ILike(current.Name, pattern) ||
                EF.Functions.ILike(current.Code, pattern));
        }

        return await query
            .OrderBy(current => current.Name)
            .Take(limit)
            .Select(current => new LookupOptionDto(current.Id, current.Name, current.Code))
            .ToListAsync(cancellationToken);
    }

    private static async Task<IReadOnlyList<LookupOptionDto>> SearchCategoriesAsync(
        AppDbContext dbContext,
        string? keyword,
        int limit,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Categories.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var pattern = $"%{keyword}%";
            query = query.Where(current =>
                EF.Functions.ILike(current.Name, pattern) ||
                EF.Functions.ILike(current.Code, pattern));
        }

        return await query
            .OrderBy(current => current.Name)
            .Take(limit)
            .Select(current => new LookupOptionDto(current.Id, current.Name, current.Code))
            .ToListAsync(cancellationToken);
    }

    private static async Task<IReadOnlyList<LookupOptionDto>> SearchCustomersAsync(
        AppDbContext dbContext,
        string? keyword,
        int limit,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Customers.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var pattern = $"%{keyword}%";
            query = query.Where(current =>
                EF.Functions.ILike(current.BasicDetails.Name, pattern) ||
                EF.Functions.ILike(current.BasicDetails.Code, pattern));
        }

        return await query
            .OrderBy(current => current.BasicDetails.Name)
            .Take(limit)
            .Select(current => new LookupOptionDto(current.Id, current.BasicDetails.Name, current.BasicDetails.Code))
            .ToListAsync(cancellationToken);
    }

    private static async Task<IReadOnlyList<LookupOptionDto>> SearchVendorsAsync(
        AppDbContext dbContext,
        string? keyword,
        int limit,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Vendors.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var pattern = $"%{keyword}%";
            query = query.Where(current =>
                EF.Functions.ILike(current.BasicInfo.Name, pattern) ||
                EF.Functions.ILike(current.BasicInfo.Code, pattern));
        }

        return await query
            .OrderBy(current => current.BasicInfo.Name)
            .Take(limit)
            .Select(current => new LookupOptionDto(current.Id, current.BasicInfo.Name, current.BasicInfo.Code))
            .ToListAsync(cancellationToken);
    }

    private static async Task<IReadOnlyList<LookupOptionDto>> SearchUomsAsync(
        AppDbContext dbContext,
        string? keyword,
        int limit,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Uoms.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var pattern = $"%{keyword}%";
            query = query.Where(current =>
                EF.Functions.ILike(current.Name, pattern) ||
                EF.Functions.ILike(current.Code, pattern));
        }

        return await query
            .OrderBy(current => current.Name)
            .Take(limit)
            .Select(current => new LookupOptionDto(current.Id, current.Name, current.Code))
            .ToListAsync(cancellationToken);
    }

    private static async Task<IReadOnlyList<LookupOptionDto>> ResolveLedgersAsync(
        AppDbContext dbContext,
        IReadOnlyList<Guid> ids,
        CancellationToken cancellationToken) =>
        await dbContext.Ledgers.AsNoTracking()
            .Where(current => ids.Contains(current.Id))
            .OrderBy(current => current.Name)
            .Select(current => new LookupOptionDto(current.Id, current.Name, current.Code))
            .ToListAsync(cancellationToken);

    private static async Task<IReadOnlyList<LookupOptionDto>> ResolveCurrenciesAsync(
        AppDbContext dbContext,
        IReadOnlyList<Guid> ids,
        CancellationToken cancellationToken) =>
        await dbContext.Currencies.AsNoTracking()
            .Where(current => ids.Contains(current.Id))
            .OrderBy(current => current.Name)
            .Select(current => new LookupOptionDto(current.Id, current.Name, $"{current.Code} {current.Symbol}".Trim()))
            .ToListAsync(cancellationToken);

    private static async Task<IReadOnlyList<LookupOptionDto>> ResolveTaxesAsync(
        AppDbContext dbContext,
        IReadOnlyList<Guid> ids,
        CancellationToken cancellationToken) =>
        await dbContext.Taxes.AsNoTracking()
            .Where(current => ids.Contains(current.Id))
            .OrderBy(current => current.Name)
            .Select(current => new LookupOptionDto(current.Id, current.Name, current.Code))
            .ToListAsync(cancellationToken);

    private static async Task<IReadOnlyList<LookupOptionDto>> ResolveCategoriesAsync(
        AppDbContext dbContext,
        IReadOnlyList<Guid> ids,
        CancellationToken cancellationToken) =>
        await dbContext.Categories.AsNoTracking()
            .Where(current => ids.Contains(current.Id))
            .OrderBy(current => current.Name)
            .Select(current => new LookupOptionDto(current.Id, current.Name, current.Code))
            .ToListAsync(cancellationToken);

    private static async Task<IReadOnlyList<LookupOptionDto>> ResolveCustomersAsync(
        AppDbContext dbContext,
        IReadOnlyList<Guid> ids,
        CancellationToken cancellationToken) =>
        await dbContext.Customers.AsNoTracking()
            .Where(current => ids.Contains(current.Id))
            .OrderBy(current => current.BasicDetails.Name)
            .Select(current => new LookupOptionDto(current.Id, current.BasicDetails.Name, current.BasicDetails.Code))
            .ToListAsync(cancellationToken);

    private static async Task<IReadOnlyList<LookupOptionDto>> ResolveVendorsAsync(
        AppDbContext dbContext,
        IReadOnlyList<Guid> ids,
        CancellationToken cancellationToken) =>
        await dbContext.Vendors.AsNoTracking()
            .Where(current => ids.Contains(current.Id))
            .OrderBy(current => current.BasicInfo.Name)
            .Select(current => new LookupOptionDto(current.Id, current.BasicInfo.Name, current.BasicInfo.Code))
            .ToListAsync(cancellationToken);

    private static async Task<IReadOnlyList<LookupOptionDto>> ResolveUomsAsync(
        AppDbContext dbContext,
        IReadOnlyList<Guid> ids,
        CancellationToken cancellationToken) =>
        await dbContext.Uoms.AsNoTracking()
            .Where(current => ids.Contains(current.Id))
            .OrderBy(current => current.Name)
            .Select(current => new LookupOptionDto(current.Id, current.Name, current.Code))
            .ToListAsync(cancellationToken);
}
