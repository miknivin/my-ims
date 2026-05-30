namespace backend.Features.Masters.Ledgers;

public static class LedgerEndpoints
{
    public static IEndpointRouteBuilder MapLedgerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/ledgers").WithTags("Ledger Masters");

        group.MapGet("/", LedgerHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", LedgerHandlers.GetByIdAsync);
        group.MapPost("/", LedgerHandlers.CreateAsync);
        group.MapPut("/{id:guid}", LedgerHandlers.UpdateAsync);
        group.MapDelete("/{id:guid}", LedgerHandlers.DeleteAsync);

        return app;
    }
}


