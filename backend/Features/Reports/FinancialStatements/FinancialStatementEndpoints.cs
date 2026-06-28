namespace backend.Features.Reports.FinancialStatements;

public static class FinancialStatementEndpoints
{
    public static IEndpointRouteBuilder MapFinancialStatementEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reports/financial-statements")
                       .WithTags("Financial Statements");

        group.MapGet("/trial-balance",   TrialBalanceHandlers.GetAsync);
        group.MapGet("/profit-and-loss", ProfitAndLossHandlers.GetAsync);
        group.MapGet("/balance-sheet",   BalanceSheetHandlers.GetAsync);
        group.MapGet("/cash-flow",       CashFlowHandlers.GetAsync);

        return app;
    }
}
