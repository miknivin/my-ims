namespace backend.Features.Transactions.SalesInvoices;

public sealed record SalesInvoiceSourceReferenceDto(string Type, Guid? ReferenceId, string ReferenceNo);
public sealed record SalesInvoiceDocumentDto(string VoucherType, string No, DateOnly Date, DateOnly DueDate);
public sealed record SalesInvoiceCustomerInformationDto(Guid CustomerId, string CustomerNameSnapshot, string Address);
public sealed record SalesInvoiceFinancialDetailsDto(string PaymentMode, string? InvoiceNo, string? LrNo, Guid? CurrencyId, string? CurrencyCodeSnapshot, string? CurrencySymbolSnapshot, decimal Balance);
public sealed record SalesInvoiceGeneralDto(string? Notes, bool Taxable, string TaxApplication, bool InterState);
public sealed record SalesInvoiceLineItemDto(Guid Id, Guid SalesInvoiceId, int Sno, Guid ProductId, string? ProductCodeSnapshot, string ProductNameSnapshot, string? HsnCode, Guid UnitId, string UnitName, decimal Quantity, decimal Rate, decimal GrossAmount, decimal DiscountPercent, decimal DiscountAmount, decimal TaxableAmount, decimal TaxPercent, decimal TaxAmount, decimal CostRate, decimal CogsAmount, decimal GrossProfitAmount, decimal LineTotal, Guid? WarehouseId, string? WarehouseName);
public sealed record SalesInvoiceAdditionDto(Guid Id, string Type, Guid? LedgerId, string LedgerNameSnapshot, string? Description, decimal Amount);
public sealed record SalesInvoiceFooterDto(string? Notes, decimal Total, decimal Addition, decimal Deduction, decimal Paid, decimal NetTotal);
public sealed record SalesInvoiceListItemDto(Guid Id, string No, DateOnly Date, string CustomerName, decimal NetTotal, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc);
public sealed record SalesInvoiceDto(Guid Id, SalesInvoiceSourceReferenceDto SourceRef, SalesInvoiceDocumentDto Document, SalesInvoiceCustomerInformationDto CustomerInformation, SalesInvoiceFinancialDetailsDto FinancialDetails, SalesInvoiceGeneralDto General, IReadOnlyList<SalesInvoiceLineItemDto> Items, IReadOnlyList<SalesInvoiceAdditionDto> Additions, SalesInvoiceFooterDto Footer, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc)
{
    public static SalesInvoiceDto FromEntity(SalesInvoice salesInvoice)
    {
        return new SalesInvoiceDto(
            salesInvoice.Id,
            new SalesInvoiceSourceReferenceDto(
                ToReferenceTypeLabel(salesInvoice.SourceRef.Type),
                salesInvoice.SourceRef.ReferenceId,
                salesInvoice.SourceRef.ReferenceNo),
            new SalesInvoiceDocumentDto(
                salesInvoice.Document.VoucherType,
                salesInvoice.Document.No,
                salesInvoice.Document.Date,
                salesInvoice.Document.DueDate),
            new SalesInvoiceCustomerInformationDto(
                salesInvoice.CustomerInformation.CustomerId,
                salesInvoice.CustomerInformation.CustomerNameSnapshot,
                salesInvoice.CustomerInformation.Address),
            new SalesInvoiceFinancialDetailsDto(
                ToPaymentModeLabel(salesInvoice.FinancialDetails.PaymentMode),
                salesInvoice.FinancialDetails.InvoiceNo,
                salesInvoice.FinancialDetails.LrNo,
                salesInvoice.FinancialDetails.CurrencyId,
                salesInvoice.FinancialDetails.CurrencyCodeSnapshot,
                salesInvoice.FinancialDetails.CurrencySymbolSnapshot,
                salesInvoice.FinancialDetails.Balance),
            new SalesInvoiceGeneralDto(
                salesInvoice.General.Notes,
                salesInvoice.General.Taxable,
                ToTaxApplicationLabel(salesInvoice.General.TaxApplication),
                salesInvoice.General.InterState),
            salesInvoice.Items
                .OrderBy(item => item.Sno)
                .ThenBy(item => item.Id)
                .Select(item => new SalesInvoiceLineItemDto(
                    item.Id,
                    item.SalesInvoiceId,
                    item.Sno,
                    item.ProductId,
                    item.ProductCodeSnapshot,
                    item.ProductNameSnapshot,
                    item.HsnCode,
                    item.UnitId,
                    item.Unit?.Name ?? string.Empty,
                    item.Quantity,
                    item.Rate,
                    item.GrossAmount,
                    item.DiscountPercent,
                    item.DiscountAmount,
                    item.TaxableAmount,
                    item.TaxPercent,
                    item.TaxAmount,
                    item.CostRate,
                    item.CogsAmount,
                    item.GrossProfitAmount,
                    item.LineTotal,
                    item.WarehouseId,
                    item.Warehouse?.Name))
                .ToList(),
            salesInvoice.Additions
                .OrderBy(item => item.Id)
                .Select(item => new SalesInvoiceAdditionDto(
                    item.Id,
                    ToAdditionTypeLabel(item.Type),
                    item.LedgerId,
                    item.LedgerNameSnapshot,
                    item.Description,
                    item.Amount))
                .ToList(),
            new SalesInvoiceFooterDto(
                salesInvoice.Footer.Notes,
                salesInvoice.Footer.Total,
                salesInvoice.Footer.Addition,
                salesInvoice.Footer.Deduction,
                salesInvoice.Footer.Paid,
                salesInvoice.Footer.NetTotal),
            ToStatusLabel(salesInvoice.Status),
            salesInvoice.CreatedAtUtc,
            salesInvoice.UpdatedAtUtc);
    }

    private static string ToReferenceTypeLabel(SalesInvoiceReferenceType value) => value switch
    {
        SalesInvoiceReferenceType.SalesOrder => "SalesOrder",
        SalesInvoiceReferenceType.DeliveryNote => "DeliveryNote",
        _ => "Direct"
    };

    private static string ToPaymentModeLabel(SalesInvoicePaymentMode value) => value switch
    {
        SalesInvoicePaymentMode.Credit => "Credit",
        _ => "Cash"
    };

    private static string ToTaxApplicationLabel(SalesInvoiceTaxApplication value) => value switch
    {
        SalesInvoiceTaxApplication.BeforeDiscount => "Before Discount",
        _ => "After Discount"
    };

    private static string ToAdditionTypeLabel(SalesInvoiceAdditionType value) => value switch
    {
        SalesInvoiceAdditionType.Deduction => "Deduction",
        _ => "Addition"
    };

    private static string ToStatusLabel(SalesInvoiceStatus value) => value switch
    {
        SalesInvoiceStatus.Submitted => "Submitted",
        SalesInvoiceStatus.Cancelled => "Cancelled",
        _ => "Draft"
    };
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
