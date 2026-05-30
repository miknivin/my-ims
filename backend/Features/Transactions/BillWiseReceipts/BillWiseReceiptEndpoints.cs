namespace backend.Features.Transactions.BillWiseReceipts;

public static class BillWiseReceiptEndpoints
{
    public static IEndpointRouteBuilder MapBillWiseReceiptEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/bill-wise-receipts").WithTags("Bill Wise Receipts");

        group.MapGet("/", BillWiseReceiptHandlers.GetAllAsync);
        group.MapGet("/outstanding-invoices", BillWiseReceiptHandlers.GetOutstandingInvoicesAsync);
        group.MapGet("/{id:guid}", BillWiseReceiptHandlers.GetByIdAsync);
        group.MapPost("/", BillWiseReceiptHandlers.CreateAsync);
        group.MapPatch("/{id:guid}", BillWiseReceiptHandlers.UpdateAsync);

        return app;
    }
}


