namespace backend.Features.Reports.SalesPurchase.SalesRegister;

public sealed record SalesRegisterRowDto(
    Guid Id,
    DateOnly InvoiceDate,
    DateOnly DueDate,
    string InvoiceNo,
    string? ReferenceNo,
    Guid CustomerId,
    string CustomerName,
    decimal GrossAmount,
    decimal DiscountAmount,
    decimal AdditionAmount,
    decimal DeductionAmount,
    decimal TaxableAmount,
    decimal TaxAmount,
    decimal NetAmount,
    decimal PaidAmount,
    decimal OutstandingAmount,
    string Status);

public sealed record SalesRegisterTotalsDto(
    decimal GrossAmount,
    decimal DiscountAmount,
    decimal AdditionAmount,
    decimal DeductionAmount,
    decimal TaxableAmount,
    decimal TaxAmount,
    decimal NetAmount,
    decimal PaidAmount,
    decimal OutstandingAmount);

public sealed record SalesRegisterReportDto(
    IReadOnlyList<SalesRegisterRowDto> Items,
    SalesRegisterTotalsDto Totals,
    int Page,
    int Limit,
    int Total,
    int TotalPages,
    string? SortBy,
    string? Keyword);

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
