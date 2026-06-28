using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Reports.Inventory;

internal static class StockSummaryHandlers
{
    internal static async Task<IResult> GetAsync(
        Guid? categoryId,
        Guid? warehouseId,
        bool? showZeroStock,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var query = dbContext.InventoryBalances.AsNoTracking();

        if (warehouseId is not null)
        {
            query = query.Where(b => b.WarehouseId == warehouseId.Value);
        }

        var balances = await query
            .Select(b => new BalanceProjection(b.ItemId, b.QuantityOnHand, b.TotalValue))
            .ToListAsync(cancellationToken);

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

        var categoryIdsUsed = products.Where(p => p.CategoryId is not null).Select(p => p.CategoryId!.Value).Distinct().ToList();
        var categoryNames = await dbContext.Categories
            .AsNoTracking()
            .Where(c => categoryIdsUsed.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => c.Name, cancellationToken);

        var productById = products.ToDictionary(p => p.Id);
        var includeZero = showZeroStock == true;

        var rows = balances
            .GroupBy(b => b.ItemId)
            .Select(g =>
            {
                var qty = Round(g.Sum(b => b.QuantityOnHand));
                var value = Round(g.Sum(b => b.TotalValue));
                productById.TryGetValue(g.Key, out var product);
                var catName = product?.CategoryId is Guid cid ? categoryNames.GetValueOrDefault(cid) : null;

                return new StockSummaryRowDto(
                    g.Key,
                    product?.Code ?? string.Empty,
                    product?.Name ?? string.Empty,
                    product?.CategoryId,
                    catName,
                    product?.Uom ?? string.Empty,
                    qty,
                    value,
                    qty == 0 ? 0 : Round(value / qty));
            })
            .Where(r => includeZero || r.Quantity != 0)
            .Where(r => categoryId is null || r.CategoryId == categoryId)
            .OrderBy(r => r.ItemName)
            .ToList();

        var report = new StockSummaryReportDto(
            rows.Sum(r => r.Quantity),
            rows.Sum(r => r.Value),
            rows);

        return TypedResults.Ok(new ApiResponse<StockSummaryReportDto>(
            true, "Stock summary fetched successfully.", report));
    }

    private static decimal Round(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private sealed record BalanceProjection(Guid ItemId, decimal QuantityOnHand, decimal TotalValue);

    private sealed record ProductProjection(Guid Id, string Code, string Name, Guid? CategoryId, string Uom);
}
