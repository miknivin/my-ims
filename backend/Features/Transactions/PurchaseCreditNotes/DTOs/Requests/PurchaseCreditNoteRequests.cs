namespace backend.Features.Transactions.PurchaseCreditNotes;

public sealed record PurchaseCreditNoteSourceReferenceRequest(Guid? ReferenceId, string ReferenceNo);
public sealed record PurchaseCreditNoteDocumentRequest(string VoucherType, string No, DateOnly Date, DateOnly DueDate);
public sealed record PurchaseCreditNoteVendorInformationRequest(Guid VendorId, string VendorNameSnapshot, string Address, string? Attention, string? Phone);
public sealed record PurchaseCreditNoteFinancialDetailsRequest(string PaymentMode, string? SupplierInvoiceNo, string? LrNo, Guid? CurrencyId, string? CurrencyCodeSnapshot, string? CurrencySymbolSnapshot);
public sealed record PurchaseCreditNoteProductInformationRequest(string VendorProducts, bool OwnProductsOnly);
public sealed record PurchaseCreditNoteGeneralRequest(string? Notes, string? SearchBarcode, bool Taxable, string TaxApplication, bool InterState, bool TaxOnFoc);
public sealed record PurchaseCreditNoteLineItemRequest(int Sno, Guid SourceLineId, Guid ProductId, string? ProductCodeSnapshot, string ProductNameSnapshot, string? HsnCode, Guid UnitId, decimal Quantity, decimal Foc, decimal Rate, decimal DiscountPercent, decimal TaxPercent, decimal SellingRate, decimal WholesaleRate, decimal Mrp, Guid? WarehouseId);
public sealed record PurchaseCreditNoteAdditionRequest(string Type, Guid? LedgerId, string? LedgerNameSnapshot, string? Description, decimal Amount);
public sealed record PurchaseCreditNoteFooterRequest(string? Notes);
public sealed record CreatePurchaseCreditNoteRequest(string NoteNature, PurchaseCreditNoteSourceReferenceRequest SourceRef, PurchaseCreditNoteDocumentRequest Document, PurchaseCreditNoteVendorInformationRequest VendorInformation, PurchaseCreditNoteFinancialDetailsRequest FinancialDetails, PurchaseCreditNoteProductInformationRequest ProductInformation, PurchaseCreditNoteGeneralRequest General, IReadOnlyList<PurchaseCreditNoteLineItemRequest> Items, IReadOnlyList<PurchaseCreditNoteAdditionRequest> Additions, PurchaseCreditNoteFooterRequest Footer);
public sealed record UpdatePurchaseCreditNoteStatusRequest(string? Status);
