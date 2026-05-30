namespace backend.Features.Masters.Warehouses;

public static class WarehouseEndpoints
{
    public static IEndpointRouteBuilder MapWarehouseEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/warehouses").WithTags("Warehouse Masters");

        group.MapGet("/", WarehouseHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", WarehouseHandlers.GetByIdAsync);
        group.MapPost("/", WarehouseHandlers.CreateAsync);
        group.MapPut("/{id:guid}", WarehouseHandlers.UpdateAsync);
        group.MapDelete("/{id:guid}", WarehouseHandlers.DeleteAsync);

        return app;
    }
}


