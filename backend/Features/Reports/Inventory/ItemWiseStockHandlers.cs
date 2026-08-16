using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Reports.Inventory;

internal static class ItemWiseStockHandlers
{
    internal static async Task<IResult> GetAsync(
        DateOnly? fromDate,
        DateOnly? toDate,
        Guid? itemId,
        Guid? warehouseId,
        Guid? categoryId,
        bool? showZeroStock,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var effectiveFrom = fromDate ?? new DateOnly(today.Year, today.Month, 1);
        var effectiveTo   = toDate   ?? today;

        var fromUtc = DateTime.SpecifyKind(effectiveFrom.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
        var toUtc   = DateTime.SpecifyKind(effectiveTo.ToDateTime(TimeOnly.MaxValue),   DateTimeKind.Utc);

        var entriesQuery = dbContext.StockLedgerEntries
            .AsNoTracking()
            .Where(e => e.PostingDateUtc <= toUtc);

        if (itemId is not null)
            entriesQuery = entriesQuery.Where(e => e.ItemId == itemId.Value);

        if (warehouseId is not null)
            entriesQuery = entriesQuery.Where(e => e.WarehouseId == warehouseId.Value);

        var allEntries = await entriesQuery
            .OrderBy(e => e.PostingDateUtc)
            .ThenBy(e => e.CreatedAtUtc)
            .ThenBy(e => e.SeqNo)
            .Select(e => new LedgerEntry(
                e.ItemId, e.WarehouseId, e.PostingDateUtc,
                e.QuantityChange, e.ValueChange,
                e.BalanceQuantity, e.BalanceValue))
            .ToListAsync(cancellationToken);

        // Compute per (item, warehouse) first, then aggregate per item
        var perItemWarehouse = allEntries
            .GroupBy(e => (e.ItemId, e.WarehouseId))
            .Select(g =>
            {
                var pre    = g.Where(e => e.PostingDateUtc < fromUtc).ToList();
                var period = g.Where(e => e.PostingDateUtc >= fromUtc).ToList();

                var openingQty   = pre.Count > 0 ? pre[^1].BalanceQuantity : 0m;
                var inwardQty    = period.Where(e => e.QuantityChange > 0).Sum(e =>  e.QuantityChange);
                var outwardQty   = period.Where(e => e.QuantityChange < 0).Sum(e => -e.QuantityChange);
                var closingQty   = g.Last().BalanceQuantity;
                var closingValue = g.Last().BalanceValue;

                return (g.Key.ItemId, openingQty, inwardQty, outwardQty, closingQty, closingValue);
            })
            .ToList();

        // Aggregate across warehouses per item
        var perItem = perItemWarehouse
            .GroupBy(x => x.ItemId)
            .Select(g => new ItemBalance(
                g.Key,
                g.Sum(x => x.openingQty),
                g.Sum(x => x.inwardQty),
                g.Sum(x => x.outwardQty),
                g.Sum(x => x.closingQty),
                g.Sum(x => x.closingValue)))
            .ToList();

        var itemIds = perItem.Select(b => b.ItemId).Distinct().ToList();

        var products = await dbContext.Products
            .AsNoTracking()
            .Where(p => itemIds.Contains(p.Id))
            .Select(p => new ProductProjection(
                p.Id,
                p.BasicInfo.Code,
                p.BasicInfo.Name,
                p.Properties.Categorization.GroupCategoryId,
                p.StockAndMeasurement.StockUom != null ? p.StockAndMeasurement.StockUom.Name : string.Empty))
            .ToListAsync(cancellationToken);

        var categoryIdsUsed = products
            .Where(p => p.CategoryId is not null)
            .Select(p => p.CategoryId!.Value)
            .Distinct()
            .ToList();

        var categoryNames = await dbContext.Categories
            .AsNoTracking()
            .Where(c => categoryIdsUsed.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => c.Name, cancellationToken);

        var productById  = products.ToDictionary(p => p.Id);
        var includeZero  = showZeroStock == true;

        var rows = perItem
            .Where(b => categoryId is null ||
                (productById.TryGetValue(b.ItemId, out var p) && p.CategoryId == categoryId))
            .Where(b => includeZero || b.ClosingQty != 0 || b.InwardQty != 0 || b.OutwardQty != 0)
            .Select(b =>
            {
                productById.TryGetValue(b.ItemId, out var product);
                var catName      = product?.CategoryId is Guid cid ? categoryNames.GetValueOrDefault(cid) : null;
                var closingQty   = Round(b.ClosingQty);
                var closingValue = Round(b.ClosingValue);
                return new ItemWiseStockRowDto(
                    b.ItemId,
                    product?.Code ?? string.Empty,
                    product?.Name ?? string.Empty,
                    catName,
                    product?.Uom  ?? string.Empty,
                    Round(b.OpeningQty),
                    Round(b.InwardQty),
                    Round(b.OutwardQty),
                    closingQty,
                    closingQty == 0 ? 0 : Round(closingValue / closingQty),
                    closingValue);
            })
            .OrderBy(r => r.ItemName)
            .ToList();

        var report = new ItemWiseStockReportDto(
            effectiveFrom,
            effectiveTo,
            rows.Sum(r => r.ClosingQty),
            rows.Sum(r => r.ClosingValue),
            rows);

        return TypedResults.Ok(new ApiResponse<ItemWiseStockReportDto>(
            true, "Item-wise stock fetched successfully.", report));
    }

    private static decimal Round(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private sealed record LedgerEntry(
        Guid ItemId, Guid WarehouseId, DateTime PostingDateUtc,
        decimal QuantityChange, decimal ValueChange,
        decimal BalanceQuantity, decimal BalanceValue);

    private sealed record ItemBalance(
        Guid ItemId,
        decimal OpeningQty,
        decimal InwardQty,
        decimal OutwardQty,
        decimal ClosingQty,
        decimal ClosingValue);

    private sealed record ProductProjection(Guid Id, string Code, string Name, Guid? CategoryId, string Uom);
}
