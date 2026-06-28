namespace backend.Features.Reports.SalesPurchase.PurchaseRegister;

public static class PurchaseRegisterEndpoints
{
    public static IEndpointRouteBuilder MapPurchaseRegisterReportEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/reports/sales-purchase/purchase-register")
            .WithTags("Reports - Sales and Purchase");

        group.MapGet("/", PurchaseRegisterHandlers.GetAsync);

        return app;
    }
}
