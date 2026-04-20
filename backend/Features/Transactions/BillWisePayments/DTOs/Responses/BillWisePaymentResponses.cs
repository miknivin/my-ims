namespace backend.Features.Transactions.BillWisePayments;

public sealed record BillWisePaymentDocumentDto(string VoucherType, string No, DateOnly Date);
public sealed record BillWisePaymentVendorInformationDto(Guid VendorId, string VendorNameSnapshot, string Address, string? Attention, string? Phone);
public sealed record BillWisePaymentAccountInformationDto(Guid LedgerId, string LedgerNameSnapshot);
public sealed record BillWisePaymentPaymentDetailsDto(string? ReferenceNo, string? InstrumentNo, DateOnly? InstrumentDate, string? Notes, decimal TotalAllocated, decimal TotalDiscount, decimal Advance, decimal Amount);
public sealed record BillWisePaymentAllocationDto(Guid Id, Guid PurchaseInvoiceId, int Sno, string SourceVoucherType, string SourceNo, DateOnly SourceDate, DateOnly? SourceDueDate, string? SourceReferenceNo, string? DescriptionSnapshot, decimal OriginalAmount, decimal OutstandingBefore, decimal PaidAmount, decimal DiscountAmount, decimal OutstandingAfter);
public sealed record BillWisePaymentListItemDto(Guid Id, string No, DateOnly Date, string VendorName, decimal Amount, decimal TotalAllocated, decimal TotalDiscount, decimal Advance, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc);
public sealed record BillWisePaymentOutstandingInvoiceDto(Guid PurchaseInvoiceId, string No, DateOnly Date, DateOnly DueDate, string ReferenceNo, string? Description, decimal OriginalAmount, decimal OutstandingBalance);
public sealed record BillWisePaymentDto(Guid Id, BillWisePaymentDocumentDto Document, BillWisePaymentVendorInformationDto VendorInformation, BillWisePaymentAccountInformationDto AccountInformation, BillWisePaymentPaymentDetailsDto PaymentDetails, IReadOnlyList<BillWisePaymentAllocationDto> Allocations, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc)
{
    public static BillWisePaymentDto FromEntity(BillWisePayment payment)
    {
        return new BillWisePaymentDto(
            payment.Id,
            new BillWisePaymentDocumentDto(
                ToVoucherTypeLabel(payment.VoucherType),
                payment.No,
                payment.Date),
            new BillWisePaymentVendorInformationDto(
                payment.VendorInformation.VendorId,
                payment.VendorInformation.VendorNameSnapshot,
                payment.VendorInformation.Address,
                payment.VendorInformation.Attention,
                payment.VendorInformation.Phone),
            new BillWisePaymentAccountInformationDto(
                payment.AccountInformation.LedgerId,
                payment.AccountInformation.LedgerNameSnapshot),
            new BillWisePaymentPaymentDetailsDto(
                payment.ReferenceNo,
                payment.InstrumentNo,
                payment.InstrumentDate,
                payment.Notes,
                payment.TotalAllocated,
                payment.TotalDiscount,
                payment.Advance,
                payment.Amount),
            payment.Allocations
                .OrderBy(current => current.Sno)
                .ThenBy(current => current.Id)
                .Select(current => new BillWisePaymentAllocationDto(
                    current.Id,
                    current.PurchaseInvoiceId,
                    current.Sno,
                    ToSourceVoucherTypeLabel(current.SourceVoucherType),
                    current.SourceNo,
                    current.SourceDate,
                    current.SourceDueDate,
                    current.SourceReferenceNo,
                    current.DescriptionSnapshot,
                    current.OriginalAmount,
                    current.OutstandingBefore,
                    current.PaidAmount,
                    current.DiscountAmount,
                    current.OutstandingAfter))
                .ToList(),
            ToStatusLabel(payment.Status),
            payment.CreatedAtUtc,
            payment.UpdatedAtUtc);
    }

    private static string ToVoucherTypeLabel(BillWiseVoucherType value) => value switch
    {
        BillWiseVoucherType.Receipt => "BWR",
        _ => "BWP"
    };

    private static string ToSourceVoucherTypeLabel(BillWiseSourceVoucherType value) => value switch
    {
        BillWiseSourceVoucherType.SalesInvoice => "SI",
        _ => "PI"
    };

    private static string ToStatusLabel(BillWiseDocumentStatus value) => value switch
    {
        BillWiseDocumentStatus.Draft => "Draft",
        BillWiseDocumentStatus.Cancelled => "Cancelled",
        _ => "Submitted"
    };
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
