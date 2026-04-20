namespace backend.Features.Transactions.SalesDebitNotes;

public sealed record SalesDebitNoteSourceReferenceRequest(Guid? ReferenceId, string ReferenceNo);
public sealed record SalesDebitNoteDocumentRequest(string VoucherType, string No, DateOnly Date, DateOnly DueDate);
public sealed record SalesDebitNoteCustomerInformationRequest(Guid CustomerId, string CustomerNameSnapshot, string Address);
public sealed record SalesDebitNoteFinancialDetailsRequest(string PaymentMode, string? InvoiceNo, string? LrNo, Guid? CurrencyId, string? CurrencyCodeSnapshot, string? CurrencySymbolSnapshot, decimal Balance);
public sealed record SalesDebitNoteGeneralRequest(string? Notes, bool Taxable, string TaxApplication, bool InterState);
public sealed record SalesDebitNoteLineItemRequest(Guid SourceLineId, int Sno, Guid ProductId, string? ProductCodeSnapshot, string ProductNameSnapshot, string? HsnCode, Guid UnitId, decimal Quantity, decimal Rate, decimal DiscountPercent, decimal TaxPercent, Guid? WarehouseId);
public sealed record SalesDebitNoteAdditionRequest(string Type, Guid? LedgerId, string? LedgerNameSnapshot, string? Description, decimal Amount);
public sealed record SalesDebitNoteFooterRequest(string? Notes, decimal Paid);
public sealed record CreateSalesDebitNoteRequest(string NoteNature, SalesDebitNoteSourceReferenceRequest SourceRef, SalesDebitNoteDocumentRequest Document, SalesDebitNoteCustomerInformationRequest CustomerInformation, SalesDebitNoteFinancialDetailsRequest FinancialDetails, SalesDebitNoteGeneralRequest General, IReadOnlyList<SalesDebitNoteLineItemRequest> Items, IReadOnlyList<SalesDebitNoteAdditionRequest> Additions, SalesDebitNoteFooterRequest Footer);
public sealed record UpdateSalesDebitNoteRequest(string NoteNature, SalesDebitNoteSourceReferenceRequest SourceRef, SalesDebitNoteDocumentRequest Document, SalesDebitNoteCustomerInformationRequest CustomerInformation, SalesDebitNoteFinancialDetailsRequest FinancialDetails, SalesDebitNoteGeneralRequest General, IReadOnlyList<SalesDebitNoteLineItemRequest> Items, IReadOnlyList<SalesDebitNoteAdditionRequest> Additions, SalesDebitNoteFooterRequest Footer, string? Status);
