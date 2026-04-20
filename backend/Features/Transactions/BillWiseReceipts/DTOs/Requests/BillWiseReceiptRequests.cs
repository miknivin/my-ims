namespace backend.Features.Transactions.BillWiseReceipts;

public sealed record BillWiseReceiptDocumentRequest(string No, DateOnly Date);
public sealed record BillWiseReceiptCustomerInformationRequest(Guid CustomerId, string CustomerNameSnapshot, string Address);
public sealed record BillWiseReceiptAccountInformationRequest(Guid LedgerId, string? LedgerNameSnapshot);
public sealed record BillWiseReceiptDetailsRequest(string? ReferenceNo, string? InstrumentNo, DateOnly? InstrumentDate, string? Notes, decimal Advance);
public sealed record BillWiseReceiptAllocationRequest(int Sno, Guid SalesInvoiceId, decimal PaidAmount, decimal DiscountAmount);
public sealed record CreateBillWiseReceiptRequest(BillWiseReceiptDocumentRequest Document, BillWiseReceiptCustomerInformationRequest CustomerInformation, BillWiseReceiptAccountInformationRequest AccountInformation, BillWiseReceiptDetailsRequest ReceiptDetails, IReadOnlyList<BillWiseReceiptAllocationRequest> Allocations, string? Status);
public sealed record UpdateBillWiseReceiptRequest(BillWiseReceiptDocumentRequest Document, BillWiseReceiptCustomerInformationRequest CustomerInformation, BillWiseReceiptAccountInformationRequest AccountInformation, BillWiseReceiptDetailsRequest ReceiptDetails, IReadOnlyList<BillWiseReceiptAllocationRequest> Allocations, string? Status);
