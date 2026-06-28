namespace backend.Features.Reports.ReceivablesPayables;

// ── Bill-wise Receivables / Payables ───────────────────────────────────────────

public sealed record BillWiseRowDto(
    Guid Id,
    DateOnly DocumentDate,
    DateOnly DueDate,
    string DocumentNo,
    string? ReferenceNo,
    Guid PartyId,
    string PartyName,
    decimal InvoiceAmount,
    decimal PaidAmount,
    decimal BalanceAmount,
    int OverdueDays,
    string Status);

public sealed record BillWiseTotalsDto(
    decimal InvoiceAmount,
    decimal PaidAmount,
    decimal BalanceAmount);

public sealed record BillWiseReportDto(
    DateOnly AsOfDate,
    BillWiseTotalsDto Totals,
    IReadOnlyList<BillWiseRowDto> Rows);

// ── Ageing ──────────────────────────────────────────────────────────────────

public sealed record AgeingBucketsDto(
    decimal Current,
    decimal Days1To30,
    decimal Days31To60,
    decimal Days61To90,
    decimal Over90,
    decimal Total);

public sealed record AgeingRowDto(
    Guid PartyId,
    string PartyName,
    AgeingBucketsDto Buckets);

public sealed record AgeingReportDto(
    DateOnly AsOfDate,
    AgeingBucketsDto Totals,
    IReadOnlyList<AgeingRowDto> Rows);
