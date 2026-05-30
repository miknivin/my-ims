namespace backend.Features.Masters.Discounts;

public static class DiscountEndpoints
{
    public static IEndpointRouteBuilder MapDiscountEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/discounts").WithTags("Discount Masters");

        group.MapGet("/", DiscountHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", DiscountHandlers.GetByIdAsync);
        group.MapPost("/", DiscountHandlers.CreateAsync);
        group.MapPut("/{id:guid}", DiscountHandlers.UpdateAsync);
        group.MapDelete("/{id:guid}", DiscountHandlers.DeleteAsync);

        return app;
    }
}


