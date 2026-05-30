namespace backend.Features.Accounting.Journals;

public static class JournalVoucherEndpoints
{
    public static IEndpointRouteBuilder MapJournalVoucherEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/operations/accounting/journal-vouchers")
            .WithTags("Operations - Accounting");

        group.MapGet("/", JournalVoucherHandlers.GetListAsync);
        group.MapGet("/{id:guid}", JournalVoucherHandlers.GetByIdAsync);
        group.MapPost("/", JournalVoucherHandlers.CreateManualAsync);

        return app;
    }
}
