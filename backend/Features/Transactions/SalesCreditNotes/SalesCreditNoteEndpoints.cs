namespace backend.Features.Transactions.SalesCreditNotes;

public static class SalesCreditNoteEndpoints
{
    public static IEndpointRouteBuilder MapSalesCreditNoteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/sales-credit-notes").WithTags("Sales Credit Notes");

        group.MapGet("/", SalesCreditNoteHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", SalesCreditNoteHandlers.GetByIdAsync);
        group.MapPost("/", SalesCreditNoteHandlers.CreateAsync);
        group.MapPatch("/{id:guid}", SalesCreditNoteHandlers.UpdateStatusAsync);

        return app;
    }
}


