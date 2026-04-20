using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Ledgers;

public static class LedgerEndpoints
{
    public static IEndpointRouteBuilder MapLedgerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/ledgers").WithTags("Ledger Masters");

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
        var ledgers = await dbContext.Ledgers
            .Include(current => current.LedgerGroup)
            .Include(current => current.DefaultCurrency)
            .OrderBy(current => current.Name)
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<LedgerDto>>(
            true,
            "Ledgers fetched successfully.",
            ledgers.Select(LedgerDto.FromEntity).ToList()));
    }

    private static async Task<IResult> GetByIdAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var ledger = await dbContext.Ledgers
            .Include(current => current.LedgerGroup)
            .Include(current => current.DefaultCurrency)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return ledger is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Ledger not found.", null))
            : TypedResults.Ok(new ApiResponse<LedgerDto>(
                true,
                "Ledger fetched successfully.",
                LedgerDto.FromEntity(ledger)));
    }

    private static async Task<IResult> CreateAsync(
        CreateLedgerRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildLedgerRequest(
            request.Code,
            request.Name,
            request.Alias,
            request.Status);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.Ledgers.AnyAsync(
                current => current.Code == buildResult.Code || current.Name == buildResult.Name,
                cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Ledger with this code or name already exists.", null));
        }

        var (ledgerGroup, currency, referenceError) = await PopulateLedgerReferencesAsync(
            request.LedgerGroupId,
            request.DefaultCurrencyId,
            dbContext,
            cancellationToken);
        if (referenceError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, referenceError, null));
        }

        var now = DateTime.UtcNow;
        var ledger = new Ledger
        {
            Code = buildResult.Code,
            Name = buildResult.Name,
            Alias = buildResult.Alias,
            LedgerGroupId = ledgerGroup!.Id,
            LedgerGroup = ledgerGroup,
            DefaultCurrencyId = currency?.Id,
            DefaultCurrency = currency,
            Status = buildResult.Status,
            AllowManualPosting = request.AllowManualPosting,
            IsBillWise = request.IsBillWise,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.Ledgers.Add(ledger);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Created($"/api/masters/ledgers/{ledger.Id}", new ApiResponse<LedgerDto>(
            true,
            "Ledger created successfully.",
            LedgerDto.FromEntity(ledger)));
    }

    private static async Task<IResult> UpdateAsync(
        Guid id,
        UpdateLedgerRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildLedgerRequest(
            request.Code,
            request.Name,
            request.Alias,
            request.Status);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        var ledger = await dbContext.Ledgers
            .Include(current => current.LedgerGroup)
            .Include(current => current.DefaultCurrency)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        if (ledger is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Ledger not found.", null));
        }

        if (ledger.IsSystem)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "System ledgers cannot be edited.", null));
        }

        if (await dbContext.Ledgers.AnyAsync(
                current => current.Id != id && (current.Code == buildResult.Code || current.Name == buildResult.Name),
                cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Ledger with this code or name already exists.", null));
        }

        var (ledgerGroup, currency, referenceError) = await PopulateLedgerReferencesAsync(
            request.LedgerGroupId,
            request.DefaultCurrencyId,
            dbContext,
            cancellationToken);
        if (referenceError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, referenceError, null));
        }

        ledger.Code = buildResult.Code;
        ledger.Name = buildResult.Name;
        ledger.Alias = buildResult.Alias;
        ledger.LedgerGroupId = ledgerGroup!.Id;
        ledger.LedgerGroup = ledgerGroup;
        ledger.DefaultCurrencyId = currency?.Id;
        ledger.DefaultCurrency = currency;
        ledger.Status = buildResult.Status;
        ledger.AllowManualPosting = request.AllowManualPosting;
        ledger.IsBillWise = request.IsBillWise;
        ledger.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<LedgerDto>(
            true,
            "Ledger updated successfully.",
            LedgerDto.FromEntity(ledger)));
    }

    private static async Task<IResult> DeleteAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var ledger = await dbContext.Ledgers.FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (ledger is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Ledger not found.", null));
        }

        if (ledger.IsSystem)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "System ledgers cannot be deleted.", null));
        }

        dbContext.Ledgers.Remove(ledger);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Ledger deleted successfully.", null));
    }

    private static async Task<(LedgerGroup? LedgerGroup, backend.Features.Masters.Currencies.Currency? Currency, string? Error)> PopulateLedgerReferencesAsync(
        Guid ledgerGroupId,
        Guid? currencyId,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var ledgerGroup = await dbContext.LedgerGroups.FirstOrDefaultAsync(
            current => current.Id == ledgerGroupId,
            cancellationToken);
        if (ledgerGroup is null)
        {
            return (null, null, "Selected ledger group does not exist.");
        }

        if (ledgerGroup.Status != LedgerGroupStatuses.Active)
        {
            return (null, null, "Selected ledger group must be active.");
        }

        var currency = await ResolveCurrencyAsync(currencyId, dbContext, cancellationToken);
        if (currencyId is not null && currency is null)
        {
            return (null, null, "Selected default currency does not exist.");
        }

        return (ledgerGroup, currency, null);
    }

    private static async Task<backend.Features.Masters.Currencies.Currency?> ResolveCurrencyAsync(
        Guid? currencyId,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (currencyId is null)
        {
            return null;
        }

        return await dbContext.Currencies.FirstOrDefaultAsync(current => current.Id == currencyId.Value, cancellationToken);
    }

    private static LedgerRequestBuildResult BuildLedgerRequest(
        string? code,
        string? name,
        string? alias,
        string? status)
    {
        var normalizedCode = code?.Trim().ToUpperInvariant() ?? string.Empty;
        var normalizedName = name?.Trim() ?? string.Empty;
        var normalizedAlias = string.IsNullOrWhiteSpace(alias) ? null : alias.Trim();
        var normalizedStatus = string.IsNullOrWhiteSpace(status) ? LedgerStatuses.Active : status.Trim();

        if (string.IsNullOrWhiteSpace(normalizedCode))
        {
            return new LedgerRequestBuildResult("Ledger code is required.");
        }

        if (normalizedCode.Length < 2)
        {
            return new LedgerRequestBuildResult("Ledger code must be at least 2 characters.");
        }

        if (normalizedCode.Length > 20)
        {
            return new LedgerRequestBuildResult("Ledger code cannot exceed 20 characters.");
        }

        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return new LedgerRequestBuildResult("Ledger name is required.");
        }

        if (normalizedName.Length < 3)
        {
            return new LedgerRequestBuildResult("Ledger name must be at least 3 characters.");
        }

        if (normalizedName.Length > 120)
        {
            return new LedgerRequestBuildResult("Ledger name cannot exceed 120 characters.");
        }

        if (normalizedAlias is not null && normalizedAlias.Length > 120)
        {
            return new LedgerRequestBuildResult("Ledger alias cannot exceed 120 characters.");
        }

        if (!LedgerStatuses.All.Contains(normalizedStatus, StringComparer.OrdinalIgnoreCase))
        {
            return new LedgerRequestBuildResult("Status must be either Active or Inactive.");
        }

        var requestedStatus = normalizedStatus;
        normalizedStatus = LedgerStatuses.All.First(value => value.Equals(requestedStatus, StringComparison.OrdinalIgnoreCase));
        return new LedgerRequestBuildResult(null, normalizedCode, normalizedName, normalizedAlias, normalizedStatus);
    }

    private sealed record LedgerRequestBuildResult(
        string? Error,
        string Code = "",
        string Name = "",
        string? Alias = null,
        string Status = "");
}
