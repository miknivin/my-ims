namespace backend.Features.Masters.Uoms;

public static class UomEndpoints
{
    public static IEndpointRouteBuilder MapUomEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/uoms").WithTags("UOM Masters");

        group.MapGet("/", UomHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", UomHandlers.GetByIdAsync);
        group.MapPost("/", UomHandlers.CreateAsync);
        group.MapPut("/{id:guid}", UomHandlers.UpdateAsync);
        group.MapDelete("/{id:guid}", UomHandlers.DeleteAsync);

        return app;
    }
}


