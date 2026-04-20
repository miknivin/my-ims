using backend.Features.Transactions;

namespace backend.Features.Transactions.PurchaseDebitNotes;

public sealed record PurchaseDebitNoteSourceReferenceDto(Guid? ReferenceId, string ReferenceNo);
public sealed record PurchaseDebitNoteDocumentDto(string VoucherType, string No, DateOnly Date, DateOnly DueDate);
public sealed record PurchaseDebitNoteVendorInformationDto(Guid VendorId, string VendorNameSnapshot, string Address, string? Attention, string? Phone);
public sealed record PurchaseDebitNoteFinancialDetailsDto(string PaymentMode, string? SupplierInvoiceNo, string? LrNo, Guid? CurrencyId, string? CurrencyCodeSnapshot, string? CurrencySymbolSnapshot);
public sealed record PurchaseDebitNoteProductInformationDto(string VendorProducts, bool OwnProductsOnly);
public sealed record PurchaseDebitNoteGeneralDto(string? Notes, string? SearchBarcode, bool Taxable, string TaxApplication, bool InterState, bool TaxOnFoc);
public sealed record PurchaseDebitNoteLineItemDto(Guid Id, Guid PurchaseDebitNoteId, Guid SourceLineId, int Sno, Guid ProductId, string? ProductCodeSnapshot, string ProductNameSnapshot, string? HsnCode, Guid UnitId, string UnitName, decimal Quantity, decimal Foc, decimal Rate, decimal GrossAmount, decimal DiscountPercent, decimal DiscountAmount, decimal TaxableAmount, decimal TaxPercent, decimal TaxAmount, decimal Cost, decimal ProfitPercent, decimal ProfitAmount, decimal SellingRate, decimal WholesaleRate, decimal Mrp, decimal LineTotal, Guid? WarehouseId, string? WarehouseName);
public sealed record PurchaseDebitNoteAdditionDto(Guid Id, string Type, Guid? LedgerId, string LedgerNameSnapshot, string? Description, decimal Amount);
public sealed record PurchaseDebitNoteFooterDto(string? Notes, decimal Total, decimal Discount, decimal Addition, decimal Deduction, decimal NetTotal);
public sealed record PurchaseDebitNoteListItemDto(Guid Id, string No, DateOnly Date, string CounterpartyName, decimal NetTotal, string NoteNature, string InventoryEffect, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc);
public sealed record PurchaseDebitNoteDto(Guid Id, string NoteNature, bool AffectsInventory, string InventoryEffect, PurchaseDebitNoteSourceReferenceDto SourceRef, PurchaseDebitNoteDocumentDto Document, PurchaseDebitNoteVendorInformationDto VendorInformation, PurchaseDebitNoteFinancialDetailsDto FinancialDetails, PurchaseDebitNoteProductInformationDto ProductInformation, PurchaseDebitNoteGeneralDto General, IReadOnlyList<PurchaseDebitNoteLineItemDto> Items, IReadOnlyList<PurchaseDebitNoteAdditionDto> Additions, PurchaseDebitNoteFooterDto Footer, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc)
{
    public static PurchaseDebitNoteDto FromEntity(PurchaseDebitNote purchaseDebitNote)
    {
        return new PurchaseDebitNoteDto(
            purchaseDebitNote.Id,
            AdjustmentNoteConventions.ToNatureLabel(purchaseDebitNote.NoteNature),
            purchaseDebitNote.AffectsInventory,
            AdjustmentNoteConventions.ToInventoryEffectLabel(purchaseDebitNote.InventoryEffect),
            new PurchaseDebitNoteSourceReferenceDto(
                purchaseDebitNote.SourceRef.ReferenceId,
                purchaseDebitNote.SourceRef.ReferenceNo),
            new PurchaseDebitNoteDocumentDto(
                purchaseDebitNote.Document.VoucherType,
                purchaseDebitNote.Document.No,
                purchaseDebitNote.Document.Date,
                purchaseDebitNote.Document.DueDate),
            new PurchaseDebitNoteVendorInformationDto(
                purchaseDebitNote.VendorInformation.VendorId,
                purchaseDebitNote.VendorInformation.VendorNameSnapshot,
                purchaseDebitNote.VendorInformation.Address,
                purchaseDebitNote.VendorInformation.Attention,
                purchaseDebitNote.VendorInformation.Phone),
            new PurchaseDebitNoteFinancialDetailsDto(
                ToPaymentModeLabel(purchaseDebitNote.FinancialDetails.PaymentMode),
                purchaseDebitNote.FinancialDetails.SupplierInvoiceNo,
                purchaseDebitNote.FinancialDetails.LrNo,
                purchaseDebitNote.FinancialDetails.CurrencyId,
                purchaseDebitNote.FinancialDetails.CurrencyCodeSnapshot,
                purchaseDebitNote.FinancialDetails.CurrencySymbolSnapshot),
            new PurchaseDebitNoteProductInformationDto(
                purchaseDebitNote.ProductInformation.VendorProducts,
                purchaseDebitNote.ProductInformation.OwnProductsOnly),
            new PurchaseDebitNoteGeneralDto(
                purchaseDebitNote.General.Notes,
                purchaseDebitNote.General.SearchBarcode,
                purchaseDebitNote.General.Taxable,
                ToTaxApplicationLabel(purchaseDebitNote.General.TaxApplication),
                purchaseDebitNote.General.InterState,
                purchaseDebitNote.General.TaxOnFoc),
            purchaseDebitNote.Items
                .OrderBy(item => item.Sno)
                .ThenBy(item => item.Id)
                .Select(item => new PurchaseDebitNoteLineItemDto(
                    item.Id,
                    item.PurchaseDebitNoteId,
                    item.SourceLineId,
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
            purchaseDebitNote.Additions
                .OrderBy(item => item.Id)
                .Select(item => new PurchaseDebitNoteAdditionDto(
                    item.Id,
                    ToAdditionTypeLabel(item.Type),
                    item.LedgerId,
                    item.LedgerNameSnapshot,
                    item.Description,
                    item.Amount))
                .ToList(),
            new PurchaseDebitNoteFooterDto(
                purchaseDebitNote.Footer.Notes,
                purchaseDebitNote.Footer.Total,
                purchaseDebitNote.Footer.Discount,
                purchaseDebitNote.Footer.Addition,
                purchaseDebitNote.Footer.Deduction,
                purchaseDebitNote.Footer.NetTotal),
            ToStatusLabel(purchaseDebitNote.Status),
            purchaseDebitNote.CreatedAtUtc,
            purchaseDebitNote.UpdatedAtUtc);
    }

    private static string ToPaymentModeLabel(PurchaseDebitNotePaymentMode value) => value switch
    {
        PurchaseDebitNotePaymentMode.Cash => "Cash",
        _ => "Credit"
    };

    private static string ToTaxApplicationLabel(PurchaseDebitNoteTaxApplication value) => value switch
    {
        PurchaseDebitNoteTaxApplication.BeforeDiscount => "Before Discount",
        _ => "After Discount"
    };

    private static string ToAdditionTypeLabel(PurchaseDebitNoteAdditionType value) => value switch
    {
        PurchaseDebitNoteAdditionType.Deduction => "Deduction",
        _ => "Addition"
    };

    private static string ToStatusLabel(PurchaseDebitNoteStatus value) => value switch
    {
        PurchaseDebitNoteStatus.Submitted => "Submitted",
        PurchaseDebitNoteStatus.Cancelled => "Cancelled",
        _ => "Draft"
    };
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
