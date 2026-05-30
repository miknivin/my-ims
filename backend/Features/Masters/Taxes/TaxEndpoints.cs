namespace backend.Features.Masters.Taxes;

public static class TaxEndpoints
{
    public static IEndpointRouteBuilder MapTaxEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/taxes").WithTags("Tax Masters");

        group.MapGet("/", TaxHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", TaxHandlers.GetByIdAsync);
        group.MapPost("/", TaxHandlers.CreateAsync);
        group.MapPut("/{id:guid}", TaxHandlers.UpdateAsync);
        group.MapDelete("/{id:guid}", TaxHandlers.DeleteAsync);

        return app;
    }
}


