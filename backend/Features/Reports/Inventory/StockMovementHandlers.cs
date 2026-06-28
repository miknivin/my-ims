using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Reports.Inventory;

internal static class StockMovementHandlers
{
    internal static async Task<IResult> GetAsync(
        Guid itemId,
        Guid? warehouseId,
        DateOnly? fromDate,
        DateOnly? toDate,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (itemId == Guid.Empty)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "Item is required.", null));
        }

        if (fromDate is null || toDate is null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "From date and to date are required.", null));
        }

        if (fromDate > toDate)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "From date cannot be greater than to date.", null));
        }

        var item = await dbContext.Products
            .AsNoTracking()
            .Where(p => p.Id == itemId)
            .Select(p => new { p.Id, p.BasicInfo.Name })
            .FirstOrDefaultAsync(cancellationToken);

        if (item is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Item not found.", null));
        }

        var fromUtc = DateTime.SpecifyKind(fromDate.Value.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
        var toUtc = DateTime.SpecifyKind(toDate.Value.ToDateTime(TimeOnly.MaxValue), DateTimeKind.Utc);

        var baseQuery = dbContext.StockLedgerEntries
            .AsNoTracking()
            .Where(e => e.ItemId == itemId);

        if (warehouseId is not null)
        {
            baseQuery = baseQuery.Where(e => e.WarehouseId == warehouseId.Value);
        }

        // Opening = running balance carried by the last entry strictly before the period
        var openingEntry = await baseQuery
            .Where(e => e.PostingDateUtc < fromUtc)
            .OrderByDescending(e => e.PostingDateUtc)
            .ThenByDescending(e => e.CreatedAtUtc)
            .Select(e => new { e.BalanceQuantity, e.BalanceValue })
            .FirstOrDefaultAsync(cancellationToken);

        var openingQty = openingEntry?.BalanceQuantity ?? 0;
        var openingValue = openingEntry?.BalanceValue ?? 0;

        var periodEntries = await baseQuery
            .Where(e => e.PostingDateUtc >= fromUtc && e.PostingDateUtc <= toUtc)
            .OrderBy(e => e.PostingDateUtc).ThenBy(e => e.CreatedAtUtc)
            .Select(e => new EntryProjection(
                e.Id,
                e.PostingDateUtc,
                e.MovementType,
                e.SourceType,
                e.WarehouseId,
                e.QuantityChange,
                e.ValuationRate,
                e.ValueChange,
                e.BalanceQuantity,
                e.BalanceValue,
                e.Remarks))
            .ToListAsync(cancellationToken);

        var warehouseIds = periodEntries.Select(e => e.WarehouseId).Distinct().ToList();
        var warehouseNames = await dbContext.Warehouses
            .AsNoTracking()
            .Where(w => warehouseIds.Contains(w.Id))
            .ToDictionaryAsync(w => w.Id, w => w.Name, cancellationToken);

        var rows = periodEntries
            .Select(e => new StockMovementRowDto(
                e.Id,
                e.PostingDateUtc,
                e.MovementType,
                e.SourceType,
                warehouseNames.GetValueOrDefault(e.WarehouseId),
                Round(e.QuantityChange),
                Round(e.ValuationRate),
                Round(e.ValueChange),
                Round(e.BalanceQuantity),
                Round(e.BalanceValue),
                e.Remarks))
            .ToList();

        var closingQty = rows.Count > 0 ? rows[^1].BalanceQuantity : openingQty;
        var closingValue = rows.Count > 0 ? rows[^1].BalanceValue : openingValue;

        var report = new StockMovementReportDto(
            item.Id, item.Name, fromDate.Value, toDate.Value,
            Round(openingQty), Round(openingValue),
            Round(closingQty), Round(closingValue),
            rows);

        return TypedResults.Ok(new ApiResponse<StockMovementReportDto>(
            true, "Stock movement fetched successfully.", report));
    }

    private static decimal Round(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private sealed record EntryProjection(
        Guid Id,
        DateTime PostingDateUtc,
        string MovementType,
        string SourceType,
        Guid WarehouseId,
        decimal QuantityChange,
        decimal ValuationRate,
        decimal ValueChange,
        decimal BalanceQuantity,
        decimal BalanceValue,
        string? Remarks);
}
