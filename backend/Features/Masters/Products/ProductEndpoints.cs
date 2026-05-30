namespace backend.Features.Masters.Products;

public static class ProductEndpoints
{
    public static IEndpointRouteBuilder MapProductEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/products").WithTags("Product Masters");

        group.MapGet("/", ProductHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", ProductHandlers.GetByIdAsync);
        group.MapPost("/", ProductHandlers.CreateAsync);
        group.MapPut("/{id:guid}", ProductHandlers.UpdateAsync);
        group.MapDelete("/{id:guid}", ProductHandlers.DeleteAsync);

        return app;
    }
}


