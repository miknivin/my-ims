namespace backend.Features.Inventory.DeliveryNotes;

public static class DeliveryNoteEndpoints
{
    public static IEndpointRouteBuilder MapDeliveryNoteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/inventory/delivery-notes").WithTags("Delivery Notes").RequireAuthorization();

        group.MapGet("/", DeliveryNoteHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", DeliveryNoteHandlers.GetByIdAsync);
        group.MapPost("/", DeliveryNoteHandlers.CreateAsync);
        group.MapPut("/{id:guid}", DeliveryNoteHandlers.UpdateAsync);
        group.MapPost("/preview-pdf", DeliveryNoteHandlers.PreviewPdfAsync);
        group.MapGet("/{id:guid}/pdf", DeliveryNoteHandlers.DownloadPdfAsync);
        group.MapPatch("/{id:guid}", DeliveryNoteHandlers.UpdateStatusAsync);

        return app;
    }
}
