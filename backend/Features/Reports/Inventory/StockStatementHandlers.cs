using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Reports.Inventory;

internal static class StockStatementHandlers
{
    internal static async Task<IResult> GetAsync(
        DateOnly? fromDate,
        DateOnly? toDate,
        string? groupBy,
        Guid? categoryId,
        Guid? warehouseId,
        bool? showZeroStock,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (fromDate is null || toDate is null)
            return TypedResults.BadRequest(new ApiResponse<object>(false, "From date and to date are required.", null));

        if (fromDate > toDate)
            return TypedResults.BadRequest(new ApiResponse<object>(false, "From date cannot be greater than to date.", null));

        var fromUtc = DateTime.SpecifyKind(fromDate.Value.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
        var toUtc   = DateTime.SpecifyKind(toDate.Value.ToDateTime(TimeOnly.MaxValue),   DateTimeKind.Utc);
        var byWarehouse = string.Equals(groupBy, "warehouse", StringComparison.OrdinalIgnoreCase);
        var includeZero = showZeroStock == true;

        var entriesQuery = dbContext.StockLedgerEntries
            .AsNoTracking()
            .Where(e => e.PostingDateUtc <= toUtc);

        if (warehouseId is not null)
            entriesQuery = entriesQuery.Where(e => e.WarehouseId == warehouseId.Value);

        var allEntries = await entriesQuery
            .OrderBy(e => e.PostingDateUtc).ThenBy(e => e.CreatedAtUtc)
            .Select(e => new LedgerEntry(
                e.ItemId, e.WarehouseId, e.PostingDateUtc,
                e.QuantityChange, e.ValueChange,
                e.BalanceQuantity, e.BalanceValue))
            .ToListAsync(cancellationToken);

        // Compute opening / inward / outward / closing per (item, warehouse)
        var pairs = allEntries
            .GroupBy(e => (e.ItemId, e.WarehouseId))
            .Select(g =>
            {
                var pre    = g.Where(e => e.PostingDateUtc < fromUtc).ToList();
                var period = g.Where(e => e.PostingDateUtc >= fromUtc).ToList();

                var openingQty   = pre.Count > 0 ? pre[^1].BalanceQuantity : 0m;
                var openingValue = pre.Count > 0 ? pre[^1].BalanceValue    : 0m;

                var inwardQty    = period.Where(e => e.QuantityChange > 0).Sum(e =>  e.QuantityChange);
                var inwardValue  = period.Where(e => e.ValueChange    > 0).Sum(e =>  e.ValueChange);
                var outwardQty   = period.Where(e => e.QuantityChange < 0).Sum(e => -e.QuantityChange);
                var outwardValue = period.Where(e => e.ValueChange    < 0).Sum(e => -e.ValueChange);

                var last         = g.Last();
                var closingQty   = last.BalanceQuantity;
                var closingValue = last.BalanceValue;

                return new PairBalance(
                    g.Key.ItemId, g.Key.WarehouseId,
                    openingQty, openingValue,
                    inwardQty,  inwardValue,
                    outwardQty, outwardValue,
                    closingQty, closingValue);
            })
            .ToList();

        // Resolve product and category info
        var itemIds = pairs.Select(p => p.ItemId).Distinct().ToList();

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

        var warehouseIds = pairs.Select(p => p.WarehouseId).Distinct().ToList();
        var warehouseNames = await dbContext.Warehouses
            .AsNoTracking()
            .Where(w => warehouseIds.Contains(w.Id))
            .ToDictionaryAsync(w => w.Id, w => w.Name, cancellationToken);

        var productById = products.ToDictionary(p => p.Id);

        // Apply categoryId filter
        var filtered = categoryId is null
            ? pairs
            : pairs.Where(p => productById.TryGetValue(p.ItemId, out var prod) && prod.CategoryId == categoryId).ToList();

        List<StockStatementRowDto> rows;

        if (byWarehouse)
        {
            rows = filtered
                .Where(p => includeZero || p.ClosingQty != 0 || p.InwardQty != 0 || p.OutwardQty != 0)
                .Select(p =>
                {
                    productById.TryGetValue(p.ItemId, out var product);
                    var catName = product?.CategoryId is Guid cid ? categoryNames.GetValueOrDefault(cid) : null;
                    var closingQty   = Round(p.ClosingQty);
                    var closingValue = Round(p.ClosingValue);
                    return new StockStatementRowDto(
                        p.ItemId,
                        product?.Code  ?? string.Empty,
                        product?.Name  ?? string.Empty,
                        catName,
                        warehouseNames.GetValueOrDefault(p.WarehouseId, string.Empty),
                        product?.Uom   ?? string.Empty,
                        Round(p.OpeningQty),   Round(p.OpeningValue),
                        Round(p.InwardQty),    Round(p.InwardValue),
                        Round(p.OutwardQty),   Round(p.OutwardValue),
                        closingQty, closingValue,
                        closingQty == 0 ? 0 : Round(closingValue / closingQty));
                })
                .OrderBy(r => r.WarehouseName).ThenBy(r => r.ItemName)
                .ToList();
        }
        else
        {
            rows = filtered
                .GroupBy(p => p.ItemId)
                .Select(g =>
                {
                    var openingQty   = Round(g.Sum(p => p.OpeningQty));
                    var openingValue = Round(g.Sum(p => p.OpeningValue));
                    var inwardQty    = Round(g.Sum(p => p.InwardQty));
                    var inwardValue  = Round(g.Sum(p => p.InwardValue));
                    var outwardQty   = Round(g.Sum(p => p.OutwardQty));
                    var outwardValue = Round(g.Sum(p => p.OutwardValue));
                    var closingQty   = Round(g.Sum(p => p.ClosingQty));
                    var closingValue = Round(g.Sum(p => p.ClosingValue));

                    productById.TryGetValue(g.Key, out var product);
                    var catName = product?.CategoryId is Guid cid ? categoryNames.GetValueOrDefault(cid) : null;

                    return new StockStatementRowDto(
                        g.Key,
                        product?.Code  ?? string.Empty,
                        product?.Name  ?? string.Empty,
                        catName,
                        null,
                        product?.Uom   ?? string.Empty,
                        openingQty, openingValue,
                        inwardQty,  inwardValue,
                        outwardQty, outwardValue,
                        closingQty, closingValue,
                        closingQty == 0 ? 0 : Round(closingValue / closingQty));
                })
                .Where(r => includeZero || r.ClosingQty != 0 || r.InwardQty != 0 || r.OutwardQty != 0)
                .OrderBy(r => r.ItemName)
                .ToList();
        }

        var report = new StockStatementReportDto(
            fromDate.Value,
            toDate.Value,
            byWarehouse ? "warehouse" : "category",
            Round(rows.Sum(r => r.OpeningValue)),
            Round(rows.Sum(r => r.InwardValue)),
            Round(rows.Sum(r => r.OutwardValue)),
            Round(rows.Sum(r => r.ClosingValue)),
            rows);

        return TypedResults.Ok(new ApiResponse<StockStatementReportDto>(
            true, "Stock statement fetched successfully.", report));
    }

    private static decimal Round(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private sealed record LedgerEntry(
        Guid ItemId, Guid WarehouseId, DateTime PostingDateUtc,
        decimal QuantityChange, decimal ValueChange,
        decimal BalanceQuantity, decimal BalanceValue);

    private sealed record PairBalance(
        Guid ItemId, Guid WarehouseId,
        decimal OpeningQty, decimal OpeningValue,
        decimal InwardQty,  decimal InwardValue,
        decimal OutwardQty, decimal OutwardValue,
        decimal ClosingQty, decimal ClosingValue);

    private sealed record ProductProjection(Guid Id, string Code, string Name, Guid? CategoryId, string Uom);
}
