namespace backend.Features.Masters.Currencies;

public static class CurrencyEndpoints
{
    public static IEndpointRouteBuilder MapCurrencyEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/currencies").WithTags("Currency Masters");

        group.MapGet("/", CurrencyHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", CurrencyHandlers.GetByIdAsync);
        group.MapPost("/", CurrencyHandlers.CreateAsync);
        group.MapPut("/{id:guid}", CurrencyHandlers.UpdateAsync);
        group.MapDelete("/{id:guid}", CurrencyHandlers.DeleteAsync);

        return app;
    }
}


