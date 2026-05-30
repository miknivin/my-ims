namespace backend.Features.Transactions.SalesDebitNotes;

public static class SalesDebitNoteEndpoints
{
    public static IEndpointRouteBuilder MapSalesDebitNoteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/sales-debit-notes").WithTags("Sales Debit Notes");

        group.MapGet("/", SalesDebitNoteHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", SalesDebitNoteHandlers.GetByIdAsync);
        group.MapPost("/", SalesDebitNoteHandlers.CreateAsync);
        group.MapPatch("/{id:guid}", SalesDebitNoteHandlers.UpdateStatusAsync);

        return app;
    }
}


