namespace backend.Features.Transactions.PurchaseInvoices;

public static class PurchaseInvoiceEndpoints
{
    public static IEndpointRouteBuilder MapPurchaseInvoiceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/purchase-invoices").WithTags("Purchase Invoices").RequireAuthorization();

        group.MapGet("/", PurchaseInvoiceHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", PurchaseInvoiceHandlers.GetByIdAsync);
        group.MapGet("/{id:guid}/pdf", PurchaseInvoiceHandlers.DownloadPdfAsync);
        group.MapPost("/", PurchaseInvoiceHandlers.CreateAsync);
        group.MapPatch("/{id:guid}", PurchaseInvoiceHandlers.UpdateStatusAsync);
        group.MapPost("/preview-pdf", PurchaseInvoiceHandlers.PreviewPdfAsync);

        return app;
    }
}

