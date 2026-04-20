namespace backend.Features.Transactions.SalesInvoices;

public sealed record SalesInvoiceSourceReferenceRequest(string Type, Guid? ReferenceId, string ReferenceNo);
public sealed record SalesInvoiceDocumentRequest(string VoucherType, string No, DateOnly Date, DateOnly DueDate);
public sealed record SalesInvoiceCustomerInformationRequest(Guid CustomerId, string CustomerNameSnapshot, string Address);
public sealed record SalesInvoiceFinancialDetailsRequest(string PaymentMode, string? InvoiceNo, string? LrNo, Guid? CurrencyId, string? CurrencyCodeSnapshot, string? CurrencySymbolSnapshot, decimal Balance);
public sealed record SalesInvoiceGeneralRequest(string? Notes, bool Taxable, string TaxApplication, bool InterState);
public sealed record SalesInvoiceLineItemRequest(int Sno, Guid ProductId, string? ProductCodeSnapshot, string ProductNameSnapshot, string? HsnCode, Guid UnitId, decimal Quantity, decimal Rate, decimal DiscountPercent, decimal TaxPercent, Guid? WarehouseId);
public sealed record SalesInvoiceAdditionRequest(string Type, Guid? LedgerId, string? LedgerNameSnapshot, string? Description, decimal Amount);
public sealed record SalesInvoiceFooterRequest(string? Notes, decimal Paid);
public sealed record CreateSalesInvoiceRequest(SalesInvoiceSourceReferenceRequest SourceRef, SalesInvoiceDocumentRequest Document, SalesInvoiceCustomerInformationRequest CustomerInformation, SalesInvoiceFinancialDetailsRequest FinancialDetails, SalesInvoiceGeneralRequest General, IReadOnlyList<SalesInvoiceLineItemRequest> Items, IReadOnlyList<SalesInvoiceAdditionRequest> Additions, SalesInvoiceFooterRequest Footer);
public sealed record UpdateSalesInvoiceRequest(SalesInvoiceSourceReferenceRequest SourceRef, SalesInvoiceDocumentRequest Document, SalesInvoiceCustomerInformationRequest CustomerInformation, SalesInvoiceFinancialDetailsRequest FinancialDetails, SalesInvoiceGeneralRequest General, IReadOnlyList<SalesInvoiceLineItemRequest> Items, IReadOnlyList<SalesInvoiceAdditionRequest> Additions, SalesInvoiceFooterRequest Footer, string? Status);
