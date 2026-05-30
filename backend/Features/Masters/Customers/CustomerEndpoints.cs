namespace backend.Features.Masters.Customers;

public static class CustomerEndpoints
{
    public static IEndpointRouteBuilder MapCustomerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/customers").WithTags("Customer Masters");

        group.MapGet("/", CustomerHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", CustomerHandlers.GetByIdAsync);
        group.MapPost("/", CustomerHandlers.CreateAsync);
        group.MapPut("/{id:guid}", CustomerHandlers.UpdateAsync);
        group.MapDelete("/{id:guid}", CustomerHandlers.DeleteAsync);

        return app;
    }
}


