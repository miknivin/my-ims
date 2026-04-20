namespace backend.Features.Transactions.PurchaseInvoices;

public sealed record PurchaseInvoiceSourceReferenceRequest(string Type, Guid? ReferenceId, string ReferenceNo);
public sealed record PurchaseInvoiceDocumentRequest(string No, DateOnly Date, DateOnly DueDate);
public sealed record PurchaseInvoiceVendorInformationRequest(Guid VendorId, string VendorNameSnapshot, string Address, string? Attention, string? Phone);
public sealed record PurchaseInvoiceFinancialDetailsRequest(string PaymentMode, string? SupplierInvoiceNo, string? LrNo, Guid? CurrencyId, string? CurrencyCodeSnapshot, string? CurrencySymbolSnapshot);
public sealed record PurchaseInvoiceProductInformationRequest(string VendorProducts, bool OwnProductsOnly);
public sealed record PurchaseInvoiceGeneralRequest(string? Notes, string? SearchBarcode, bool Taxable, string TaxApplication, bool InterState, bool TaxOnFoc);
public sealed record PurchaseInvoiceLineItemRequest(int Sno, Guid ProductId, string? ProductCodeSnapshot, string ProductNameSnapshot, string? HsnCode, Guid UnitId, decimal Quantity, decimal Foc, decimal Rate, decimal DiscountPercent, decimal TaxPercent, decimal SellingRate, decimal WholesaleRate, decimal Mrp, Guid? WarehouseId);
public sealed record PurchaseInvoiceAdditionRequest(string Type, Guid? LedgerId, string? LedgerNameSnapshot, string? Description, decimal Amount);
public sealed record PurchaseInvoiceFooterRequest(string? Notes);
public sealed record CreatePurchaseInvoiceRequest(PurchaseInvoiceSourceReferenceRequest SourceRef, PurchaseInvoiceDocumentRequest Document, PurchaseInvoiceVendorInformationRequest VendorInformation, PurchaseInvoiceFinancialDetailsRequest FinancialDetails, PurchaseInvoiceProductInformationRequest ProductInformation, PurchaseInvoiceGeneralRequest General, IReadOnlyList<PurchaseInvoiceLineItemRequest> Items, IReadOnlyList<PurchaseInvoiceAdditionRequest> Additions, PurchaseInvoiceFooterRequest Footer);
public sealed record UpdatePurchaseInvoiceRequest(PurchaseInvoiceSourceReferenceRequest SourceRef, PurchaseInvoiceDocumentRequest Document, PurchaseInvoiceVendorInformationRequest VendorInformation, PurchaseInvoiceFinancialDetailsRequest FinancialDetails, PurchaseInvoiceProductInformationRequest ProductInformation, PurchaseInvoiceGeneralRequest General, IReadOnlyList<PurchaseInvoiceLineItemRequest> Items, IReadOnlyList<PurchaseInvoiceAdditionRequest> Additions, PurchaseInvoiceFooterRequest Footer, string? Status);
