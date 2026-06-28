using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Reports.Inventory;

internal static class ItemWiseStockHandlers
{
    internal static async Task<IResult> GetAsync(
        Guid? itemId,
        Guid? warehouseId,
        Guid? categoryId,
        bool? showZeroStock,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var query = dbContext.InventoryBalances.AsNoTracking();

        if (itemId is not null)
        {
            query = query.Where(b => b.ItemId == itemId.Value);
        }

        if (warehouseId is not null)
        {
            query = query.Where(b => b.WarehouseId == warehouseId.Value);
        }

        var balances = await query
            .Select(b => new BalanceProjection(b.ItemId, b.WarehouseId, b.QuantityOnHand, b.ValuationRate, b.TotalValue))
            .ToListAsync(cancellationToken);

        var itemIds = balances.Select(b => b.ItemId).Distinct().ToList();
        var warehouseIds = balances.Select(b => b.WarehouseId).Distinct().ToList();

        var products = await dbContext.Products
            .AsNoTracking()
            .Where(p => itemIds.Contains(p.Id))
            .Select(p => new ProductProjection(p.Id, p.BasicInfo.Code, p.BasicInfo.Name, p.Properties.Categorization.GroupCategoryId))
            .ToListAsync(cancellationToken);

        var warehouseNames = await dbContext.Warehouses
            .AsNoTracking()
            .Where(w => warehouseIds.Contains(w.Id))
            .ToDictionaryAsync(w => w.Id, w => w.Name, cancellationToken);

        var productById = products.ToDictionary(p => p.Id);
        var includeZero = showZeroStock == true;

        var rows = balances
            .Where(b => includeZero || b.QuantityOnHand != 0)
            .Where(b => categoryId is null ||
                (productById.TryGetValue(b.ItemId, out var p) && p.CategoryId == categoryId))
            .Select(b =>
            {
                productById.TryGetValue(b.ItemId, out var product);
                return new ItemWiseStockRowDto(
                    b.ItemId,
                    product?.Code ?? string.Empty,
                    product?.Name ?? string.Empty,
                    b.WarehouseId,
                    warehouseNames.GetValueOrDefault(b.WarehouseId, string.Empty),
                    Round(b.QuantityOnHand),
                    Round(b.ValuationRate),
                    Round(b.TotalValue));
            })
            .OrderBy(r => r.ItemName).ThenBy(r => r.WarehouseName)
            .ToList();

        var report = new ItemWiseStockReportDto(
            rows.Sum(r => r.Quantity),
            rows.Sum(r => r.Value),
            rows);

        return TypedResults.Ok(new ApiResponse<ItemWiseStockReportDto>(
            true, "Item-wise stock fetched successfully.", report));
    }

    private static decimal Round(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private sealed record BalanceProjection(Guid ItemId, Guid WarehouseId, decimal QuantityOnHand, decimal ValuationRate, decimal TotalValue);

    private sealed record ProductProjection(Guid Id, string Code, string Name, Guid? CategoryId);
}
