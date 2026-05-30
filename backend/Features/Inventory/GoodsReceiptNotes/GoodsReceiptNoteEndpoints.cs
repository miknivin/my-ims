namespace backend.Features.Inventory.GoodsReceiptNotes;

public static class GoodsReceiptNoteEndpoints
{
    public static IEndpointRouteBuilder MapGoodsReceiptNoteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/inventory/goods-receipt-notes").WithTags("Goods Receipt Notes");

        group.MapGet("/", GoodsReceiptNoteHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", GoodsReceiptNoteHandlers.GetByIdAsync);
        group.MapPost("/", GoodsReceiptNoteHandlers.CreateAsync);
        group.MapPatch("/{id:guid}", GoodsReceiptNoteHandlers.UpdateStatusAsync);

        return app;
    }
}


