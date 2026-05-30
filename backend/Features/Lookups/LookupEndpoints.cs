namespace backend.Features.Lookups;

public static class LookupEndpoints
{
    public static IEndpointRouteBuilder MapLookupEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/lookups").WithTags("Lookups");

        group.MapGet("/{source}", LookupHandlers.SearchAsync);
        group.MapPost("/resolve", LookupHandlers.ResolveAsync);

        return app;
    }
}


