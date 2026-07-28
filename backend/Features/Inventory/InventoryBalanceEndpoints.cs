using backend.Features.Transactions.PurchaseInvoices;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Inventory;

public static class InventoryBalanceEndpoints
{
    public static IEndpointRouteBuilder MapInventoryBalanceEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/inventory/balance", GetBalanceAsync)
            .WithTags("Inventory")
            .RequireAuthorization();
        return app;
    }

    internal static async Task<IResult> GetBalanceAsync(
        Guid productId,
        Guid? warehouseId,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var query = dbContext.InventoryBalances
            .AsNoTracking()
            .Where(b => b.ItemId == productId);

        if (warehouseId.HasValue)
            query = query.Where(b => b.WarehouseId == warehouseId.Value);

        var balances = await query.ToListAsync(cancellationToken);

        var latestProfitPercent = await dbContext.PurchaseInvoiceLineItems
            .Where(li => li.ProductId == productId && li.PurchaseInvoice!.Status == PurchaseInvoiceStatus.Submitted)
            .OrderByDescending(li => li.PurchaseInvoice!.Document.Date)
            .ThenByDescending(li => li.PurchaseInvoice!.CreatedAtUtc)
            .Select(li => (decimal?)li.ProfitPercent)
            .FirstOrDefaultAsync(cancellationToken);

        if (balances.Count == 0)
            return TypedResults.Ok(new ApiResponse<InventoryBalanceDto>(true, "No stock on hand.", new InventoryBalanceDto(0m, 0m, latestProfitPercent)));

        var totalQty = balances.Sum(b => b.QuantityOnHand);
        var totalValue = balances.Sum(b => b.TotalValue);
        var valuationRate = totalQty > 0 ? Math.Round(totalValue / totalQty, 4) : 0m;

        return TypedResults.Ok(new ApiResponse<InventoryBalanceDto>(true, "Inventory balance fetched.", new InventoryBalanceDto(valuationRate, totalQty, latestProfitPercent)));
    }
}

internal sealed record InventoryBalanceDto(decimal ValuationRate, decimal QuantityOnHand, decimal? LatestProfitPercent);

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
