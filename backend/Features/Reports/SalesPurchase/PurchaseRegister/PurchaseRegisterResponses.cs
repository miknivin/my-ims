namespace backend.Features.Reports.SalesPurchase.PurchaseRegister;

public sealed record PurchaseRegisterRowDto(
    Guid Id,
    DateOnly InvoiceDate,
    DateOnly DueDate,
    string InvoiceNo,
    string? ReferenceNo,
    Guid VendorId,
    string VendorName,
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

public sealed record PurchaseRegisterTotalsDto(
    decimal GrossAmount,
    decimal DiscountAmount,
    decimal AdditionAmount,
    decimal DeductionAmount,
    decimal TaxableAmount,
    decimal TaxAmount,
    decimal NetAmount,
    decimal PaidAmount,
    decimal OutstandingAmount);

public sealed record PurchaseRegisterReportDto(
    IReadOnlyList<PurchaseRegisterRowDto> Items,
    PurchaseRegisterTotalsDto Totals,
    int Page,
    int Limit,
    int Total,
    int TotalPages,
    string? SortBy,
    string? Keyword);

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
