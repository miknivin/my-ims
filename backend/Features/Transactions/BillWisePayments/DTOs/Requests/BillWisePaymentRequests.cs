namespace backend.Features.Transactions.BillWisePayments;

public sealed record BillWisePaymentDocumentRequest(string No, DateOnly Date);
public sealed record BillWisePaymentVendorInformationRequest(Guid VendorId, string VendorNameSnapshot, string Address, string? Attention, string? Phone);
public sealed record BillWisePaymentAccountInformationRequest(Guid LedgerId, string? LedgerNameSnapshot);
public sealed record BillWisePaymentPaymentDetailsRequest(string? ReferenceNo, string? InstrumentNo, DateOnly? InstrumentDate, string? Notes, decimal Advance);
public sealed record BillWisePaymentAllocationRequest(int Sno, Guid PurchaseInvoiceId, decimal PaidAmount, decimal DiscountAmount);
public sealed record CreateBillWisePaymentRequest(BillWisePaymentDocumentRequest Document, BillWisePaymentVendorInformationRequest VendorInformation, BillWisePaymentAccountInformationRequest AccountInformation, BillWisePaymentPaymentDetailsRequest PaymentDetails, IReadOnlyList<BillWisePaymentAllocationRequest> Allocations, string? Status);
public sealed record UpdateBillWisePaymentStatusRequest(string? Status);
