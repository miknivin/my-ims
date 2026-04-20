namespace backend.Features.Transactions.PurchaseInvoices;

public sealed record PurchaseInvoiceSourceReferenceDto(string Type, Guid? ReferenceId, string ReferenceNo);
public sealed record PurchaseInvoiceDocumentDto(string No, DateOnly Date, DateOnly DueDate);
public sealed record PurchaseInvoiceVendorInformationDto(Guid VendorId, string VendorNameSnapshot, string Address, string? Attention, string? Phone);
public sealed record PurchaseInvoiceFinancialDetailsDto(string PaymentMode, string? SupplierInvoiceNo, string? LrNo, Guid? CurrencyId, string? CurrencyCodeSnapshot, string? CurrencySymbolSnapshot, decimal Balance);
public sealed record PurchaseInvoiceProductInformationDto(string VendorProducts, bool OwnProductsOnly);
public sealed record PurchaseInvoiceGeneralDto(string? Notes, string? SearchBarcode, bool Taxable, string TaxApplication, bool InterState, bool TaxOnFoc);
public sealed record PurchaseInvoiceLineItemDto(Guid Id, Guid PurchaseInvoiceId, int Sno, Guid ProductId, string? ProductCodeSnapshot, string ProductNameSnapshot, string? HsnCode, Guid UnitId, string UnitName, decimal Quantity, decimal Foc, decimal Rate, decimal GrossAmount, decimal DiscountPercent, decimal DiscountAmount, decimal TaxableAmount, decimal TaxPercent, decimal TaxAmount, decimal Cost, decimal ProfitPercent, decimal ProfitAmount, decimal SellingRate, decimal WholesaleRate, decimal Mrp, decimal LineTotal, Guid? WarehouseId, string? WarehouseName);
public sealed record PurchaseInvoiceAdditionDto(Guid Id, string Type, Guid? LedgerId, string LedgerNameSnapshot, string? Description, decimal Amount);
public sealed record PurchaseInvoiceFooterDto(string? Notes, decimal Total, decimal Discount, decimal Addition, decimal Deduction, decimal NetTotal);
public sealed record PurchaseInvoiceListItemDto(Guid Id, string No, DateOnly Date, string VendorName, decimal NetTotal, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc);
public sealed record PurchaseInvoiceDto(Guid Id, PurchaseInvoiceSourceReferenceDto SourceRef, PurchaseInvoiceDocumentDto Document, PurchaseInvoiceVendorInformationDto VendorInformation, PurchaseInvoiceFinancialDetailsDto FinancialDetails, PurchaseInvoiceProductInformationDto ProductInformation, PurchaseInvoiceGeneralDto General, IReadOnlyList<PurchaseInvoiceLineItemDto> Items, IReadOnlyList<PurchaseInvoiceAdditionDto> Additions, PurchaseInvoiceFooterDto Footer, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc)
{
    public static PurchaseInvoiceDto FromEntity(PurchaseInvoice purchaseInvoice)
    {
        return new PurchaseInvoiceDto(
            purchaseInvoice.Id,
            new PurchaseInvoiceSourceReferenceDto(
                ToReferenceTypeLabel(purchaseInvoice.SourceRef.Type),
                purchaseInvoice.SourceRef.ReferenceId,
                purchaseInvoice.SourceRef.ReferenceNo),
            new PurchaseInvoiceDocumentDto(
                purchaseInvoice.Document.No,
                purchaseInvoice.Document.Date,
                purchaseInvoice.Document.DueDate),
            new PurchaseInvoiceVendorInformationDto(
                purchaseInvoice.VendorInformation.VendorId,
                purchaseInvoice.VendorInformation.VendorNameSnapshot,
                purchaseInvoice.VendorInformation.Address,
                purchaseInvoice.VendorInformation.Attention,
                purchaseInvoice.VendorInformation.Phone),
            new PurchaseInvoiceFinancialDetailsDto(
                ToPaymentModeLabel(purchaseInvoice.FinancialDetails.PaymentMode),
                purchaseInvoice.FinancialDetails.SupplierInvoiceNo,
                purchaseInvoice.FinancialDetails.LrNo,
                purchaseInvoice.FinancialDetails.CurrencyId,
                purchaseInvoice.FinancialDetails.CurrencyCodeSnapshot,
                purchaseInvoice.FinancialDetails.CurrencySymbolSnapshot,
                purchaseInvoice.FinancialDetails.Balance),
            new PurchaseInvoiceProductInformationDto(
                purchaseInvoice.ProductInformation.VendorProducts,
                purchaseInvoice.ProductInformation.OwnProductsOnly),
            new PurchaseInvoiceGeneralDto(
                purchaseInvoice.General.Notes,
                purchaseInvoice.General.SearchBarcode,
                purchaseInvoice.General.Taxable,
                ToTaxApplicationLabel(purchaseInvoice.General.TaxApplication),
                purchaseInvoice.General.InterState,
                purchaseInvoice.General.TaxOnFoc),
            purchaseInvoice.Items
                .OrderBy(item => item.Sno)
                .ThenBy(item => item.Id)
                .Select(item => new PurchaseInvoiceLineItemDto(
                    item.Id,
                    item.PurchaseInvoiceId,
                    item.Sno,
                    item.ProductId,
                    item.ProductCodeSnapshot,
                    item.ProductNameSnapshot,
                    item.HsnCode,
                    item.UnitId,
                    item.Unit?.Name ?? string.Empty,
                    item.Quantity,
                    item.Foc,
                    item.Rate,
                    item.GrossAmount,
                    item.DiscountPercent,
                    item.DiscountAmount,
                    item.TaxableAmount,
                    item.TaxPercent,
                    item.TaxAmount,
                    item.Cost,
                    item.ProfitPercent,
                    item.ProfitAmount,
                    item.SellingRate,
                    item.WholesaleRate,
                    item.Mrp,
                    item.LineTotal,
                    item.WarehouseId,
                    item.Warehouse?.Name))
                .ToList(),
            purchaseInvoice.Additions
                .OrderBy(item => item.Id)
                .Select(item => new PurchaseInvoiceAdditionDto(
                    item.Id,
                    ToAdditionTypeLabel(item.Type),
                    item.LedgerId,
                    item.LedgerNameSnapshot,
                    item.Description,
                    item.Amount))
                .ToList(),
            new PurchaseInvoiceFooterDto(
                purchaseInvoice.Footer.Notes,
                purchaseInvoice.Footer.Total,
                purchaseInvoice.Footer.Discount,
                purchaseInvoice.Footer.Addition,
                purchaseInvoice.Footer.Deduction,
                purchaseInvoice.Footer.NetTotal),
            ToStatusLabel(purchaseInvoice.Status),
            purchaseInvoice.CreatedAtUtc,
            purchaseInvoice.UpdatedAtUtc);
    }

    private static string ToReferenceTypeLabel(PurchaseInvoiceReferenceType value) => value switch
    {
        PurchaseInvoiceReferenceType.PurchaseOrder => "PurchaseOrder",
        PurchaseInvoiceReferenceType.GoodsReceipt => "GoodsReceipt",
        _ => "Direct"
    };

    private static string ToPaymentModeLabel(PurchaseInvoicePaymentMode value) => value switch
    {
        PurchaseInvoicePaymentMode.Cash => "Cash",
        _ => "Credit"
    };

    private static string ToTaxApplicationLabel(PurchaseInvoiceTaxApplication value) => value switch
    {
        PurchaseInvoiceTaxApplication.BeforeDiscount => "Before Discount",
        _ => "After Discount"
    };

    private static string ToAdditionTypeLabel(PurchaseInvoiceAdditionType value) => value switch
    {
        PurchaseInvoiceAdditionType.Deduction => "Deduction",
        _ => "Addition"
    };

    private static string ToStatusLabel(PurchaseInvoiceStatus value) => value switch
    {
        PurchaseInvoiceStatus.Submitted => "Submitted",
        PurchaseInvoiceStatus.Cancelled => "Cancelled",
        _ => "Draft"
    };
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
