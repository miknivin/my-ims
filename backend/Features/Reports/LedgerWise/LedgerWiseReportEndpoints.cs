namespace backend.Features.Reports.LedgerWise;

public static class LedgerWiseReportEndpoints
{
    public static IEndpointRouteBuilder MapLedgerWiseReportEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reports/ledger-wise").WithTags("Ledger-wise Reports");

        group.MapGet("/", LedgerWiseReportHandlers.GetAsync);

        return app;
    }
}


