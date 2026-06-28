using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Reports.Inventory;

internal static class InventoryValuationHandlers
{
    internal static async Task<IResult> GetAsync(
        DateOnly? asOfDate,
        Guid? categoryId,
        Guid? warehouseId,
        bool? showZeroStock,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var effectiveAsOf = asOfDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var cutoffUtc = DateTime.SpecifyKind(effectiveAsOf.ToDateTime(TimeOnly.MaxValue), DateTimeKind.Utc);

        var entriesQuery = dbContext.StockLedgerEntries
            .AsNoTracking()
            .Where(e => e.PostingDateUtc <= cutoffUtc);

        if (warehouseId is not null)
        {
            entriesQuery = entriesQuery.Where(e => e.WarehouseId == warehouseId.Value);
        }

        var entries = await entriesQuery
            .OrderBy(e => e.PostingDateUtc).ThenBy(e => e.CreatedAtUtc)
            .Select(e => new EntryProjection(e.ItemId, e.WarehouseId, e.BalanceQuantity, e.BalanceValue))
            .ToListAsync(cancellationToken);

        // Latest entry per (Item, Warehouse) as of the cutoff date — its running balance is the as-of-date stock position
        var latest = entries
            .GroupBy(e => (e.ItemId, e.WarehouseId))
            .Select(g => g.Last())
            .ToList();

        var itemIds = latest.Select(l => l.ItemId).Distinct().ToList();
        var warehouseIds = latest.Select(l => l.WarehouseId).Distinct().ToList();

        var products = await dbContext.Products
            .AsNoTracking()
            .Where(p => itemIds.Contains(p.Id))
            .Select(p => new ProductProjection(p.Id, p.BasicInfo.Code, p.BasicInfo.Name, p.Properties.Categorization.GroupCategoryId))
            .ToListAsync(cancellationToken);

        var categoryIdsUsed = products.Where(p => p.CategoryId is not null).Select(p => p.CategoryId!.Value).Distinct().ToList();
        var categoryNames = await dbContext.Categories
            .AsNoTracking()
            .Where(c => categoryIdsUsed.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => c.Name, cancellationToken);

        var warehouseNames = await dbContext.Warehouses
            .AsNoTracking()
            .Where(w => warehouseIds.Contains(w.Id))
            .ToDictionaryAsync(w => w.Id, w => w.Name, cancellationToken);

        var productById = products.ToDictionary(p => p.Id);
        var includeZero = showZeroStock == true;

        var rows = latest
            .Where(l => includeZero || l.BalanceQuantity != 0)
            .Where(l => categoryId is null ||
                (productById.TryGetValue(l.ItemId, out var p) && p.CategoryId == categoryId))
            .Select(l =>
            {
                productById.TryGetValue(l.ItemId, out var product);
                var catName = product?.CategoryId is Guid cid ? categoryNames.GetValueOrDefault(cid) : null;
                var qty = Round(l.BalanceQuantity);
                var value = Round(l.BalanceValue);

                return new InventoryValuationRowDto(
                    l.ItemId,
                    product?.Code ?? string.Empty,
                    product?.Name ?? string.Empty,
                    product?.CategoryId,
                    catName,
                    l.WarehouseId,
                    warehouseNames.GetValueOrDefault(l.WarehouseId, string.Empty),
                    qty,
                    qty == 0 ? 0 : Round(value / qty),
                    value);
            })
            .OrderBy(r => r.ItemName).ThenBy(r => r.WarehouseName)
            .ToList();

        var report = new InventoryValuationReportDto(
            effectiveAsOf,
            rows.Sum(r => r.Quantity),
            rows.Sum(r => r.Value),
            rows);

        return TypedResults.Ok(new ApiResponse<InventoryValuationReportDto>(
            true, "Inventory valuation fetched successfully.", report));
    }

    private static decimal Round(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private sealed record EntryProjection(Guid ItemId, Guid WarehouseId, decimal BalanceQuantity, decimal BalanceValue);

    private sealed record ProductProjection(Guid Id, string Code, string Name, Guid? CategoryId);
}
