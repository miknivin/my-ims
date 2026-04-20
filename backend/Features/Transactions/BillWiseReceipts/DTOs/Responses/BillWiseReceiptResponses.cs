namespace backend.Features.Transactions.BillWiseReceipts;

public sealed record BillWiseReceiptDocumentDto(string VoucherType, string No, DateOnly Date);
public sealed record BillWiseReceiptCustomerInformationDto(Guid CustomerId, string CustomerNameSnapshot, string Address);
public sealed record BillWiseReceiptAccountInformationDto(Guid LedgerId, string LedgerNameSnapshot);
public sealed record BillWiseReceiptDetailsDto(string? ReferenceNo, string? InstrumentNo, DateOnly? InstrumentDate, string? Notes, decimal TotalAllocated, decimal TotalDiscount, decimal Advance, decimal Amount);
public sealed record BillWiseReceiptAllocationDto(Guid Id, Guid SalesInvoiceId, int Sno, string SourceVoucherType, string SourceNo, DateOnly SourceDate, DateOnly? SourceDueDate, string? SourceReferenceNo, string? DescriptionSnapshot, decimal OriginalAmount, decimal OutstandingBefore, decimal PaidAmount, decimal DiscountAmount, decimal OutstandingAfter);
public sealed record BillWiseReceiptListItemDto(Guid Id, string No, DateOnly Date, string CustomerName, decimal Amount, decimal TotalAllocated, decimal TotalDiscount, decimal Advance, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc);
public sealed record BillWiseReceiptOutstandingInvoiceDto(Guid SalesInvoiceId, string No, DateOnly Date, DateOnly DueDate, string ReferenceNo, string? Description, decimal OriginalAmount, decimal OutstandingBalance);
public sealed record BillWiseReceiptDto(Guid Id, BillWiseReceiptDocumentDto Document, BillWiseReceiptCustomerInformationDto CustomerInformation, BillWiseReceiptAccountInformationDto AccountInformation, BillWiseReceiptDetailsDto ReceiptDetails, IReadOnlyList<BillWiseReceiptAllocationDto> Allocations, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc)
{
    public static BillWiseReceiptDto FromEntity(BillWiseReceipt receipt)
    {
        return new BillWiseReceiptDto(
            receipt.Id,
            new BillWiseReceiptDocumentDto(
                ToVoucherTypeLabel(receipt.VoucherType),
                receipt.No,
                receipt.Date),
            new BillWiseReceiptCustomerInformationDto(
                receipt.CustomerInformation.CustomerId,
                receipt.CustomerInformation.CustomerNameSnapshot,
                receipt.CustomerInformation.Address),
            new BillWiseReceiptAccountInformationDto(
                receipt.AccountInformation.LedgerId,
                receipt.AccountInformation.LedgerNameSnapshot),
            new BillWiseReceiptDetailsDto(
                receipt.ReferenceNo,
                receipt.InstrumentNo,
                receipt.InstrumentDate,
                receipt.Notes,
                receipt.TotalAllocated,
                receipt.TotalDiscount,
                receipt.Advance,
                receipt.Amount),
            receipt.Allocations
                .OrderBy(current => current.Sno)
                .ThenBy(current => current.Id)
                .Select(current => new BillWiseReceiptAllocationDto(
                    current.Id,
                    current.SalesInvoiceId,
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
            ToStatusLabel(receipt.Status),
            receipt.CreatedAtUtc,
            receipt.UpdatedAtUtc);
    }

    private static string ToVoucherTypeLabel(BillWiseVoucherType value) => value switch
    {
        BillWiseVoucherType.Payment => "BWP",
        _ => "BWR"
    };

    private static string ToSourceVoucherTypeLabel(BillWiseSourceVoucherType value) => value switch
    {
        BillWiseSourceVoucherType.PurchaseInvoice => "PI",
        _ => "SI"
    };

    private static string ToStatusLabel(BillWiseDocumentStatus value) => value switch
    {
        BillWiseDocumentStatus.Draft => "Draft",
        BillWiseDocumentStatus.Cancelled => "Cancelled",
        _ => "Submitted"
    };
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
