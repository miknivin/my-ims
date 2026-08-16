using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Reports.Inventory;

internal static class StockSummaryEnhancedHandlers
{
    internal static async Task<IResult> GetAsync(
        string? groupBy,
        DateOnly? asOfDate,
        Guid? categoryId,
        Guid? warehouseId,
        bool? showZeroStock,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var byWarehouse = string.Equals(groupBy, "warehouse", StringComparison.OrdinalIgnoreCase);
        var includeZero = showZeroStock == true;

        List<BalanceProjection> balances;

        if (asOfDate is DateOnly dateOnly)
        {
            var cutoffUtc = DateTime.SpecifyKind(dateOnly.ToDateTime(TimeOnly.MaxValue), DateTimeKind.Utc);
            balances = warehouseId is not null
                ? await dbContext.StockLedgerEntries
                    .FromSql($"""
                        SELECT DISTINCT ON ("ItemId", "WarehouseId") *
                        FROM stock_ledger_entries
                        WHERE "PostingDateUtc" <= {cutoffUtc}
                          AND "WarehouseId" = {warehouseId.Value}
                        ORDER BY "ItemId", "WarehouseId", "PostingDateUtc" DESC, "CreatedAtUtc" DESC, "SeqNo" DESC
                        """)
                    .AsNoTracking()
                    .Select(e => new BalanceProjection(e.ItemId, e.WarehouseId, e.BalanceQuantity, e.BalanceValue))
                    .ToListAsync(cancellationToken)
                : await dbContext.StockLedgerEntries
                    .FromSql($"""
                        SELECT DISTINCT ON ("ItemId", "WarehouseId") *
                        FROM stock_ledger_entries
                        WHERE "PostingDateUtc" <= {cutoffUtc}
                        ORDER BY "ItemId", "WarehouseId", "PostingDateUtc" DESC, "CreatedAtUtc" DESC, "SeqNo" DESC
                        """)
                    .AsNoTracking()
                    .Select(e => new BalanceProjection(e.ItemId, e.WarehouseId, e.BalanceQuantity, e.BalanceValue))
                    .ToListAsync(cancellationToken);
        }
        else
        {
            var query = dbContext.InventoryBalances.AsNoTracking();
            if (warehouseId is not null)
                query = query.Where(b => b.WarehouseId == warehouseId.Value);

            balances = await query
                .Select(b => new BalanceProjection(b.ItemId, b.WarehouseId, b.QuantityOnHand, b.TotalValue))
                .ToListAsync(cancellationToken);
        }

        var itemIds = balances.Select(b => b.ItemId).Distinct().ToList();

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

        var warehouseIds = balances.Select(b => b.WarehouseId).Distinct().ToList();
        var warehouseNames = await dbContext.Warehouses
            .AsNoTracking()
            .Where(w => warehouseIds.Contains(w.Id))
            .ToDictionaryAsync(w => w.Id, w => w.Name, cancellationToken);

        var productById = products.ToDictionary(p => p.Id);

        var filtered = categoryId is null
            ? balances
            : balances
                .Where(b => productById.TryGetValue(b.ItemId, out var p) && p.CategoryId == categoryId)
                .ToList();

        List<StockSummaryEnhancedRowDto> rows;

        if (byWarehouse)
        {
            rows = filtered
                .Where(b => includeZero || b.QuantityOnHand != 0)
                .Select(b =>
                {
                    productById.TryGetValue(b.ItemId, out var product);
                    var catName = product?.CategoryId is Guid cid ? categoryNames.GetValueOrDefault(cid) : null;
                    return new StockSummaryEnhancedRowDto(
                        b.ItemId,
                        product?.Code ?? string.Empty,
                        product?.Name ?? string.Empty,
                        catName,
                        warehouseNames.GetValueOrDefault(b.WarehouseId, string.Empty),
                        product?.Uom ?? string.Empty,
                        Round(b.QuantityOnHand));
                })
                .OrderBy(r => r.WarehouseName).ThenBy(r => r.ItemName)
                .ToList();
        }
        else
        {
            rows = filtered
                .GroupBy(b => b.ItemId)
                .Select(g =>
                {
                    var qty = Round(g.Sum(b => b.QuantityOnHand));
                    productById.TryGetValue(g.Key, out var product);
                    var catName = product?.CategoryId is Guid cid ? categoryNames.GetValueOrDefault(cid) : null;
                    return new StockSummaryEnhancedRowDto(
                        g.Key,
                        product?.Code ?? string.Empty,
                        product?.Name ?? string.Empty,
                        catName,
                        null,
                        product?.Uom ?? string.Empty,
                        qty);
                })
                .Where(r => includeZero || r.Quantity != 0)
                .OrderBy(r => r.ItemName)
                .ToList();
        }

        var report = new StockSummaryEnhancedReportDto(
            byWarehouse ? "warehouse" : "category",
            asOfDate,
            rows.Sum(r => r.Quantity),
            rows);

        return TypedResults.Ok(new ApiResponse<StockSummaryEnhancedReportDto>(
            true, "Stock summary fetched successfully.", report));
    }

    private static decimal Round(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private sealed record BalanceProjection(Guid ItemId, Guid WarehouseId, decimal QuantityOnHand, decimal TotalValue);
    private sealed record ProductProjection(Guid Id, string Code, string Name, Guid? CategoryId, string Uom);
}
