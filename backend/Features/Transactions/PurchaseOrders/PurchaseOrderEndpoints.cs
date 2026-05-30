namespace backend.Features.Transactions.PurchaseOrders;

public static class PurchaseOrderEndpoints
{
    public static IEndpointRouteBuilder MapPurchaseOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/purchase-orders").WithTags("Purchase Orders");

        group.MapGet("/", PurchaseOrderHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", PurchaseOrderHandlers.GetByIdAsync);
        group.MapPost("/", PurchaseOrderHandlers.CreateAsync);
        group.MapPatch("/{id:guid}", PurchaseOrderHandlers.UpdateStatusAsync);

        return app;
    }
}


