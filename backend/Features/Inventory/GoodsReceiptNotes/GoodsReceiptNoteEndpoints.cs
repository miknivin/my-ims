namespace backend.Features.Inventory.GoodsReceiptNotes;

public static class GoodsReceiptNoteEndpoints
{
    public static IEndpointRouteBuilder MapGoodsReceiptNoteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/inventory/goods-receipt-notes").WithTags("Goods Receipt Notes").RequireAuthorization();

        group.MapGet("/", GoodsReceiptNoteHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", GoodsReceiptNoteHandlers.GetByIdAsync);
        group.MapPost("/", GoodsReceiptNoteHandlers.CreateAsync);
        group.MapPut("/{id:guid}", GoodsReceiptNoteHandlers.UpdateAsync);
        group.MapPost("/preview-pdf", GoodsReceiptNoteHandlers.PreviewPdfAsync);
        group.MapGet("/{id:guid}/pdf", GoodsReceiptNoteHandlers.DownloadPdfAsync);
        group.MapPatch("/{id:guid}", GoodsReceiptNoteHandlers.UpdateStatusAsync);

        return app;
    }
}


