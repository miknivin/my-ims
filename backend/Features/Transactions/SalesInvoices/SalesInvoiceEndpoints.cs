namespace backend.Features.Transactions.SalesInvoices;

public static class SalesInvoiceEndpoints
{
    public static IEndpointRouteBuilder MapSalesInvoiceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/sales-invoices").WithTags("Sales Invoices").RequireAuthorization();

        group.MapGet("/", SalesInvoiceHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", SalesInvoiceHandlers.GetByIdAsync);
        group.MapPost("/", SalesInvoiceHandlers.CreateAsync);
        group.MapPatch("/{id:guid}", SalesInvoiceHandlers.UpdateStatusAsync);
        group.MapGet("/{id:guid}/pdf", SalesInvoiceHandlers.DownloadPdfAsync);
        group.MapPost("/preview-pdf", SalesInvoiceHandlers.PreviewPdfAsync);

        return app;
    }
}


