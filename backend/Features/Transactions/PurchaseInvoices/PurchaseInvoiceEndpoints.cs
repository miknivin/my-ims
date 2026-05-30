namespace backend.Features.Transactions.PurchaseInvoices;

public static class PurchaseInvoiceEndpoints
{
    public static IEndpointRouteBuilder MapPurchaseInvoiceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/purchase-invoices").WithTags("Purchase Invoices");

        group.MapGet("/", PurchaseInvoiceHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", PurchaseInvoiceHandlers.GetByIdAsync);
        group.MapPost("/", PurchaseInvoiceHandlers.CreateAsync);
        group.MapPatch("/{id:guid}", PurchaseInvoiceHandlers.UpdateStatusAsync);

        return app;
    }
}

