namespace backend.Features.Transactions.PurchaseInvoiceAi;

public static class PurchaseInvoiceAiEndpoints
{
    public static IEndpointRouteBuilder MapPurchaseInvoiceAiEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/purchase-invoice-ai").WithTags("Purchase Invoice AI");

        group.MapPost("/map", PurchaseInvoiceAiHandlers.MapAsync).DisableAntiforgery();
        group.MapPost("/master-match", PurchaseInvoiceAiHandlers.MasterMatchAsync);

        return app;
    }
}


