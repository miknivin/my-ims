using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Reports.Inventory;

internal static class InventoryValuationHandlers
{
    internal static async Task<IResult> GetAsync(
        DateOnly? asOfDate,
        string? groupBy,
        Guid? categoryId,
        Guid? warehouseId,
        bool? showZeroStock,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var byWarehouse = string.Equals(groupBy, "warehouse", StringComparison.OrdinalIgnoreCase);
        var effectiveAsOf = asOfDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var cutoffUtc = DateTime.SpecifyKind(effectiveAsOf.ToDateTime(TimeOnly.MaxValue), DateTimeKind.Utc);

        var latest = warehouseId is not null
            ? await dbContext.StockLedgerEntries
                .FromSql($"""
                    SELECT DISTINCT ON ("ItemId", "WarehouseId") *
                    FROM stock_ledger_entries
                    WHERE "PostingDateUtc" <= {cutoffUtc}
                      AND "WarehouseId" = {warehouseId.Value}
                    ORDER BY "ItemId", "WarehouseId", "PostingDateUtc" DESC, "CreatedAtUtc" DESC, "SeqNo" DESC
                    """)
                .AsNoTracking()
                .Select(e => new EntryProjection(e.ItemId, e.WarehouseId, e.BalanceQuantity, e.BalanceValue))
                .ToListAsync(cancellationToken)
            : await dbContext.StockLedgerEntries
                .FromSql($"""
                    SELECT DISTINCT ON ("ItemId", "WarehouseId") *
                    FROM stock_ledger_entries
                    WHERE "PostingDateUtc" <= {cutoffUtc}
                    ORDER BY "ItemId", "WarehouseId", "PostingDateUtc" DESC, "CreatedAtUtc" DESC, "SeqNo" DESC
                    """)
                .AsNoTracking()
                .Select(e => new EntryProjection(e.ItemId, e.WarehouseId, e.BalanceQuantity, e.BalanceValue))
                .ToListAsync(cancellationToken);

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

        var categoryFiltered = categoryId is null
            ? latest
            : latest.Where(l => productById.TryGetValue(l.ItemId, out var p) && p.CategoryId == categoryId).ToList();

        var rows = categoryFiltered
            .Where(l => includeZero || l.BalanceQuantity != 0)
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
            .OrderBy(r => r.CategoryName).ThenBy(r => r.ItemName).ThenBy(r => r.WarehouseName)
            .ToList();

        var report = new InventoryValuationReportDto(
            effectiveAsOf,
            byWarehouse ? "warehouse" : "category",
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
