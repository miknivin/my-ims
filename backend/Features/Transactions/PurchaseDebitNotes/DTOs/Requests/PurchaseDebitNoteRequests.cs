namespace backend.Features.Transactions.PurchaseDebitNotes;

public sealed record PurchaseDebitNoteSourceReferenceRequest(Guid? ReferenceId, string ReferenceNo);
public sealed record PurchaseDebitNoteDocumentRequest(string VoucherType, string No, DateOnly Date, DateOnly DueDate);
public sealed record PurchaseDebitNoteVendorInformationRequest(Guid VendorId, string VendorNameSnapshot, string Address, string? Attention, string? Phone);
public sealed record PurchaseDebitNoteFinancialDetailsRequest(string PaymentMode, string? SupplierInvoiceNo, string? LrNo, Guid? CurrencyId, string? CurrencyCodeSnapshot, string? CurrencySymbolSnapshot);
public sealed record PurchaseDebitNoteProductInformationRequest(string VendorProducts, bool OwnProductsOnly);
public sealed record PurchaseDebitNoteGeneralRequest(string? Notes, string? SearchBarcode, bool Taxable, string TaxApplication, bool InterState, bool TaxOnFoc);
public sealed record PurchaseDebitNoteLineItemRequest(int Sno, Guid SourceLineId, Guid ProductId, string? ProductCodeSnapshot, string ProductNameSnapshot, string? HsnCode, Guid UnitId, decimal Quantity, decimal Foc, decimal Rate, decimal DiscountPercent, decimal TaxPercent, decimal SellingRate, decimal WholesaleRate, decimal Mrp, Guid? WarehouseId);
public sealed record PurchaseDebitNoteAdditionRequest(string Type, Guid? LedgerId, string? LedgerNameSnapshot, string? Description, decimal Amount);
public sealed record PurchaseDebitNoteFooterRequest(string? Notes);
public sealed record CreatePurchaseDebitNoteRequest(string NoteNature, PurchaseDebitNoteSourceReferenceRequest SourceRef, PurchaseDebitNoteDocumentRequest Document, PurchaseDebitNoteVendorInformationRequest VendorInformation, PurchaseDebitNoteFinancialDetailsRequest FinancialDetails, PurchaseDebitNoteProductInformationRequest ProductInformation, PurchaseDebitNoteGeneralRequest General, IReadOnlyList<PurchaseDebitNoteLineItemRequest> Items, IReadOnlyList<PurchaseDebitNoteAdditionRequest> Additions, PurchaseDebitNoteFooterRequest Footer);
public sealed record UpdatePurchaseDebitNoteRequest(string NoteNature, PurchaseDebitNoteSourceReferenceRequest SourceRef, PurchaseDebitNoteDocumentRequest Document, PurchaseDebitNoteVendorInformationRequest VendorInformation, PurchaseDebitNoteFinancialDetailsRequest FinancialDetails, PurchaseDebitNoteProductInformationRequest ProductInformation, PurchaseDebitNoteGeneralRequest General, IReadOnlyList<PurchaseDebitNoteLineItemRequest> Items, IReadOnlyList<PurchaseDebitNoteAdditionRequest> Additions, PurchaseDebitNoteFooterRequest Footer, string? Status);
