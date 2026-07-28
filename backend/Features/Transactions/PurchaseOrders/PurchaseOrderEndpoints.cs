namespace backend.Features.Transactions.PurchaseOrders;

public static class PurchaseOrderEndpoints
{
    public static IEndpointRouteBuilder MapPurchaseOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/purchase-orders").WithTags("Purchase Orders").RequireAuthorization();

        group.MapGet("/", PurchaseOrderHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", PurchaseOrderHandlers.GetByIdAsync);
        group.MapGet("/{id:guid}/pdf", PurchaseOrderHandlers.DownloadPdfAsync);
        group.MapPost("/", PurchaseOrderHandlers.CreateAsync);
        group.MapPost("/preview-pdf", PurchaseOrderHandlers.PreviewPdfAsync);
        group.MapPut("/{id:guid}", PurchaseOrderHandlers.UpdateAsync);
        group.MapPatch("/{id:guid}", PurchaseOrderHandlers.UpdateStatusAsync);

        return app;
    }
}


