namespace backend.Features.Transactions.SalesCreditNotes;

public sealed record SalesCreditNoteSourceReferenceRequest(Guid? ReferenceId, string ReferenceNo);
public sealed record SalesCreditNoteDocumentRequest(string VoucherType, string No, DateOnly Date, DateOnly DueDate);
public sealed record SalesCreditNoteCustomerInformationRequest(Guid CustomerId, string CustomerNameSnapshot, string Address);
public sealed record SalesCreditNoteFinancialDetailsRequest(string PaymentMode, string? InvoiceNo, string? LrNo, Guid? CurrencyId, string? CurrencyCodeSnapshot, string? CurrencySymbolSnapshot, decimal Balance);
public sealed record SalesCreditNoteGeneralRequest(string? Notes, bool Taxable, string TaxApplication, bool InterState);
public sealed record SalesCreditNoteLineItemRequest(Guid SourceLineId, int Sno, Guid ProductId, string? ProductCodeSnapshot, string ProductNameSnapshot, string? HsnCode, Guid UnitId, decimal Quantity, decimal Rate, decimal DiscountPercent, decimal TaxPercent, Guid? WarehouseId);
public sealed record SalesCreditNoteAdditionRequest(string Type, Guid? LedgerId, string? LedgerNameSnapshot, string? Description, decimal Amount);
public sealed record SalesCreditNoteFooterRequest(string? Notes, decimal Paid);
public sealed record CreateSalesCreditNoteRequest(string NoteNature, SalesCreditNoteSourceReferenceRequest SourceRef, SalesCreditNoteDocumentRequest Document, SalesCreditNoteCustomerInformationRequest CustomerInformation, SalesCreditNoteFinancialDetailsRequest FinancialDetails, SalesCreditNoteGeneralRequest General, IReadOnlyList<SalesCreditNoteLineItemRequest> Items, IReadOnlyList<SalesCreditNoteAdditionRequest> Additions, SalesCreditNoteFooterRequest Footer);
public sealed record UpdateSalesCreditNoteStatusRequest(string? Status);
