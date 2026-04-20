using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Currencies;

public static class CurrencyEndpoints
{
    public static IEndpointRouteBuilder MapCurrencyEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/currencies").WithTags("Currency Masters");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPut("/{id:guid}", UpdateAsync);
        group.MapDelete("/{id:guid}", DeleteAsync);

        return app;
    }

    private static async Task<IResult> GetAllAsync(
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var currencies = await dbContext.Currencies
            .OrderBy(currency => currency.Name)
            .Select(currency => CurrencyDto.FromEntity(currency))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<CurrencyDto>>(
            true,
            "Currency list fetched successfully.",
            currencies));
    }

    private static async Task<IResult> GetByIdAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var currency = await dbContext.Currencies
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return currency is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Currency not found.", null))
            : TypedResults.Ok(new ApiResponse<CurrencyDto>(
                true,
                "Currency fetched successfully.",
                CurrencyDto.FromEntity(currency)));
    }

    private static async Task<IResult> CreateAsync(
        CreateCurrencyRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildCurrencyRequest(
            request.Code,
            request.Name,
            request.Symbol,
            request.Status);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.Currencies.AnyAsync(
                currency => currency.Code == buildResult.Code || currency.Name == buildResult.Name,
                cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Currency with this code or name already exists.", null));
        }

        var now = DateTime.UtcNow;
        var currency = new Currency
        {
            Code = buildResult.Code,
            Name = buildResult.Name,
            Symbol = buildResult.Symbol,
            Status = buildResult.Status,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.Currencies.Add(currency);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Created($"/api/masters/currencies/{currency.Id}", new ApiResponse<CurrencyDto>(
            true,
            "Currency created successfully.",
            CurrencyDto.FromEntity(currency)));
    }

    private static async Task<IResult> UpdateAsync(
        Guid id,
        UpdateCurrencyRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildCurrencyRequest(
            request.Code,
            request.Name,
            request.Symbol,
            request.Status);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        var currency = await dbContext.Currencies.FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (currency is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Currency not found.", null));
        }

        if (await dbContext.Currencies.AnyAsync(
                current => current.Id != id && (current.Code == buildResult.Code || current.Name == buildResult.Name),
                cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Currency with this code or name already exists.", null));
        }

        currency.Code = buildResult.Code;
        currency.Name = buildResult.Name;
        currency.Symbol = buildResult.Symbol;
        currency.Status = buildResult.Status;
        currency.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<CurrencyDto>(
            true,
            "Currency updated successfully.",
            CurrencyDto.FromEntity(currency)));
    }

    private static async Task<IResult> DeleteAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var currency = await dbContext.Currencies.FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (currency is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Currency not found.", null));
        }

        dbContext.Currencies.Remove(currency);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Currency deleted successfully.", null));
    }

    private static CurrencyRequestBuildResult BuildCurrencyRequest(
        string? code,
        string? name,
        string? symbol,
        string? status)
    {
        var normalizedCode = code?.Trim().ToUpperInvariant() ?? string.Empty;
        var normalizedName = name?.Trim() ?? string.Empty;
        var normalizedSymbol = symbol?.Trim() ?? string.Empty;
        var normalizedStatus = string.IsNullOrWhiteSpace(status) ? CurrencyStatuses.Active : status.Trim();

        if (string.IsNullOrWhiteSpace(normalizedCode))
        {
            return new CurrencyRequestBuildResult("Currency code is required.");
        }

        if (normalizedCode.Length < 2)
        {
            return new CurrencyRequestBuildResult("Currency code must be at least 2 characters.");
        }

        if (normalizedCode.Length > 10)
        {
            return new CurrencyRequestBuildResult("Currency code cannot exceed 10 characters.");
        }

        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return new CurrencyRequestBuildResult("Currency name is required.");
        }

        if (normalizedName.Length < 3)
        {
            return new CurrencyRequestBuildResult("Currency name must be at least 3 characters.");
        }

        if (normalizedName.Length > 50)
        {
            return new CurrencyRequestBuildResult("Currency name cannot exceed 50 characters.");
        }

        if (string.IsNullOrWhiteSpace(normalizedSymbol))
        {
            return new CurrencyRequestBuildResult("Currency symbol is required.");
        }

        if (normalizedSymbol.Length > 5)
        {
            return new CurrencyRequestBuildResult("Currency symbol cannot exceed 5 characters.");
        }

        if (!CurrencyStatuses.All.Contains(normalizedStatus, StringComparer.OrdinalIgnoreCase))
        {
            return new CurrencyRequestBuildResult("Status must be either Active or Inactive.");
        }

        var requestedStatus = normalizedStatus;
        normalizedStatus = CurrencyStatuses.All.First(value => value.Equals(requestedStatus, StringComparison.OrdinalIgnoreCase));
        return new CurrencyRequestBuildResult(null, normalizedCode, normalizedName, normalizedSymbol, normalizedStatus);
    }

    private sealed record CurrencyRequestBuildResult(
        string? Error,
        string Code = "",
        string Name = "",
        string Symbol = "",
        string Status = "");
}
