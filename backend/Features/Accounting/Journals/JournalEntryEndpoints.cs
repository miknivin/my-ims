namespace backend.Features.Accounting.Journals;

public static class JournalEntryEndpoints
{
    public static IEndpointRouteBuilder MapJournalEntryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/operations/accounting/journal-entries")
            .WithTags("Operations - Accounting");

        group.MapGet("/", JournalEntryHandlers.GetListAsync);

        return app;
    }
}
