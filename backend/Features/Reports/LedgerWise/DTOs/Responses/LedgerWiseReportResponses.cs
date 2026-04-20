namespace backend.Features.Reports.LedgerWise;

public sealed record LedgerWiseReportRowDto(
    Guid Id,
    DateOnly PostingDate,
    string VoucherType,
    string VoucherNo,
    string? Narration,
    string? SubLedgerType,
    Guid? SubLedgerId,
    string? SubLedgerCodeSnapshot,
    string? SubLedgerNameSnapshot,
    decimal DebitAmount,
    decimal CreditAmount,
    decimal RunningBalance);

public sealed record LedgerWiseReportDto(
    Guid LedgerId,
    string LedgerCode,
    string LedgerName,
    DateOnly FromDate,
    DateOnly ToDate,
    string? SubLedgerType,
    Guid? SubLedgerId,
    decimal OpeningBalance,
    decimal ClosingBalance,
    IReadOnlyList<LedgerWiseReportRowDto> Rows);

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
