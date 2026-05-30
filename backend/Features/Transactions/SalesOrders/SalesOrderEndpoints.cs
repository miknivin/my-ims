namespace backend.Features.Transactions.SalesOrders;

public static class SalesOrderEndpoints
{
    public static IEndpointRouteBuilder MapSalesOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/sales-orders")
            .WithTags("Sales Orders")
            .RequireAuthorization();

        group.MapGet("/", SalesOrderHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", SalesOrderHandlers.GetByIdAsync);
        group.MapPost("/", SalesOrderHandlers.CreateAsync);
        group.MapPatch("/{id:guid}", SalesOrderHandlers.UpdateStatusAsync);

        return app;
    }
}


