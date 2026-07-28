namespace backend.Features.Transactions.PurchaseCreditNotes;

public static class PurchaseCreditNoteEndpoints
{
    public static IEndpointRouteBuilder MapPurchaseCreditNoteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/purchase-credit-notes").WithTags("Purchase Credit Notes").RequireAuthorization();

        group.MapGet("/", PurchaseCreditNoteHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", PurchaseCreditNoteHandlers.GetByIdAsync);
        group.MapPost("/", PurchaseCreditNoteHandlers.CreateAsync);
        group.MapPatch("/{id:guid}", PurchaseCreditNoteHandlers.UpdateStatusAsync);

        return app;
    }
}


