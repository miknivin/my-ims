namespace backend.Features.Reports.FinancialStatements;

// ── Trial Balance ─────────────────────────────────────────────────────────────

public sealed record TrialBalanceRowDto(
    Guid LedgerId,
    string LedgerCode,
    string LedgerName,
    Guid GroupId,
    string GroupName,
    string Nature,
    decimal OpeningDebit,
    decimal OpeningCredit,
    decimal PeriodDebit,
    decimal PeriodCredit,
    decimal ClosingDebit,
    decimal ClosingCredit);

public sealed record TrialBalanceTotalsDto(
    decimal OpeningDebit,
    decimal OpeningCredit,
    decimal PeriodDebit,
    decimal PeriodCredit,
    decimal ClosingDebit,
    decimal ClosingCredit);

public sealed record TrialBalanceDto(
    DateOnly FromDate,
    DateOnly ToDate,
    TrialBalanceTotalsDto Totals,
    IReadOnlyList<TrialBalanceRowDto> Rows);

// ── Profit & Loss ─────────────────────────────────────────────────────────────

public sealed record ProfitAndLossLineDto(
    Guid LedgerId,
    string LedgerCode,
    string LedgerName,
    decimal Amount);

public sealed record ProfitAndLossGroupDto(
    Guid GroupId,
    string GroupName,
    decimal Total,
    IReadOnlyList<ProfitAndLossLineDto> Lines);

public sealed record ProfitAndLossDto(
    DateOnly FromDate,
    DateOnly ToDate,
    decimal TotalIncome,
    decimal TotalExpense,
    decimal NetProfit,
    IReadOnlyList<ProfitAndLossGroupDto> IncomeGroups,
    IReadOnlyList<ProfitAndLossGroupDto> ExpenseGroups);

// ── Balance Sheet ─────────────────────────────────────────────────────────────

public sealed record BalanceSheetLineDto(
    Guid LedgerId,
    string LedgerCode,
    string LedgerName,
    decimal Balance);

public sealed record BalanceSheetGroupDto(
    Guid GroupId,
    string GroupName,
    decimal Total,
    IReadOnlyList<BalanceSheetLineDto> Lines);

public sealed record BalanceSheetDto(
    DateOnly FromDate,
    DateOnly AsOfDate,
    decimal TotalAssets,
    decimal TotalLiabilities,
    decimal TotalEquity,
    decimal NetProfit,
    IReadOnlyList<BalanceSheetGroupDto> AssetGroups,
    IReadOnlyList<BalanceSheetGroupDto> LiabilityGroups,
    IReadOnlyList<BalanceSheetGroupDto> EquityGroups);

// ── Cash Flow ─────────────────────────────────────────────────────────────────

public sealed record CashFlowDto(
    DateOnly FromDate,
    DateOnly ToDate,
    decimal NetProfit,
    decimal AccountsReceivableChange,
    decimal AccountsPayableChange,
    decimal NetCashFromOperations);
