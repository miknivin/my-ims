namespace backend.Features.Masters.Ledgers;

public static class LedgerGroupEndpoints
{
    public static IEndpointRouteBuilder MapLedgerGroupEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/ledger-groups").WithTags("Ledger Group Masters");

        group.MapGet("/", LedgerGroupHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", LedgerGroupHandlers.GetByIdAsync);
        group.MapPost("/", LedgerGroupHandlers.CreateAsync);
        group.MapPut("/{id:guid}", LedgerGroupHandlers.UpdateAsync);
        group.MapDelete("/{id:guid}", LedgerGroupHandlers.DeleteAsync);

        return app;
    }
}


