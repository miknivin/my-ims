namespace backend.Features.Reports.Inventory;

public static class InventoryReportEndpoints
{
    public static IEndpointRouteBuilder MapInventoryReportEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reports/inventory")
                       .WithTags("Reports - Inventory");

        group.MapGet("/stock-summary", StockSummaryHandlers.GetAsync);
        group.MapGet("/item-wise-stock", ItemWiseStockHandlers.GetAsync);
        group.MapGet("/stock-movement", StockMovementHandlers.GetAsync);
        group.MapGet("/inventory-valuation", InventoryValuationHandlers.GetAsync);

        return app;
    }
}
