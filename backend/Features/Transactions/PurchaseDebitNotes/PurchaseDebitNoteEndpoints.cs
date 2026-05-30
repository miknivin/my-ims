namespace backend.Features.Transactions.PurchaseDebitNotes;

public static class PurchaseDebitNoteEndpoints
{
    public static IEndpointRouteBuilder MapPurchaseDebitNoteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/purchase-debit-notes").WithTags("Purchase Debit Notes");

        group.MapGet("/", PurchaseDebitNoteHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", PurchaseDebitNoteHandlers.GetByIdAsync);
        group.MapPost("/", PurchaseDebitNoteHandlers.CreateAsync);
        group.MapPatch("/{id:guid}", PurchaseDebitNoteHandlers.UpdateStatusAsync);

        return app;
    }
}


