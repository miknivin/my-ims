namespace backend.Features.Reports.ReceivablesPayables;

public static class ReceivablesPayablesEndpoints
{
    public static IEndpointRouteBuilder MapReceivablesPayablesEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reports/receivables-payables")
                       .WithTags("Reports - Receivables and Payables");

        group.MapGet("/receivables-ageing", ReceivablesAgeingHandlers.GetAsync);
        group.MapGet("/payables-ageing", PayablesAgeingHandlers.GetAsync);
        group.MapGet("/bill-wise-receivables", BillWiseReceivablesHandlers.GetAsync);
        group.MapGet("/bill-wise-payables", BillWisePayablesHandlers.GetAsync);

        return app;
    }
}
