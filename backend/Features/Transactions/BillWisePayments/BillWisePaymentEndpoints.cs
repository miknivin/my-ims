namespace backend.Features.Transactions.BillWisePayments;

public static class BillWisePaymentEndpoints
{
    public static IEndpointRouteBuilder MapBillWisePaymentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/bill-wise-payments").WithTags("Bill Wise Payments");

        group.MapGet("/", BillWisePaymentHandlers.GetAllAsync);
        group.MapGet("/outstanding-invoices", BillWisePaymentHandlers.GetOutstandingInvoicesAsync);
        group.MapGet("/{id:guid}", BillWisePaymentHandlers.GetByIdAsync);
        group.MapPost("/", BillWisePaymentHandlers.CreateAsync);
        group.MapPatch("/{id:guid}", BillWisePaymentHandlers.UpdateAsync);

        return app;
    }
}


