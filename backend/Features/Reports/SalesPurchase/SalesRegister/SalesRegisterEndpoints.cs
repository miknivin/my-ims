namespace backend.Features.Reports.SalesPurchase.SalesRegister;

public static class SalesRegisterEndpoints
{
    public static IEndpointRouteBuilder MapSalesRegisterReportEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/reports/sales-purchase/sales-register")
            .WithTags("Reports - Sales and Purchase");

        group.MapGet("/", SalesRegisterHandlers.GetAsync);

        return app;
    }
}
