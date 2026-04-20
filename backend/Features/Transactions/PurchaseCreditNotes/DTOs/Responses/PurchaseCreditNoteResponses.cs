using backend.Features.Transactions;

namespace backend.Features.Transactions.PurchaseCreditNotes;

public sealed record PurchaseCreditNoteSourceReferenceDto(Guid? ReferenceId, string ReferenceNo);
public sealed record PurchaseCreditNoteDocumentDto(string VoucherType, string No, DateOnly Date, DateOnly DueDate);
public sealed record PurchaseCreditNoteVendorInformationDto(Guid VendorId, string VendorNameSnapshot, string Address, string? Attention, string? Phone);
public sealed record PurchaseCreditNoteFinancialDetailsDto(string PaymentMode, string? SupplierInvoiceNo, string? LrNo, Guid? CurrencyId, string? CurrencyCodeSnapshot, string? CurrencySymbolSnapshot);
public sealed record PurchaseCreditNoteProductInformationDto(string VendorProducts, bool OwnProductsOnly);
public sealed record PurchaseCreditNoteGeneralDto(string? Notes, string? SearchBarcode, bool Taxable, string TaxApplication, bool InterState, bool TaxOnFoc);
public sealed record PurchaseCreditNoteLineItemDto(Guid Id, Guid PurchaseCreditNoteId, Guid SourceLineId, int Sno, Guid ProductId, string? ProductCodeSnapshot, string ProductNameSnapshot, string? HsnCode, Guid UnitId, string UnitName, decimal Quantity, decimal Foc, decimal Rate, decimal GrossAmount, decimal DiscountPercent, decimal DiscountAmount, decimal TaxableAmount, decimal TaxPercent, decimal TaxAmount, decimal Cost, decimal ProfitPercent, decimal ProfitAmount, decimal SellingRate, decimal WholesaleRate, decimal Mrp, decimal LineTotal, Guid? WarehouseId, string? WarehouseName);
public sealed record PurchaseCreditNoteAdditionDto(Guid Id, string Type, Guid? LedgerId, string LedgerNameSnapshot, string? Description, decimal Amount);
public sealed record PurchaseCreditNoteFooterDto(string? Notes, decimal Total, decimal Discount, decimal Addition, decimal Deduction, decimal NetTotal);
public sealed record PurchaseCreditNoteListItemDto(Guid Id, string No, DateOnly Date, string CounterpartyName, decimal NetTotal, string NoteNature, string InventoryEffect, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc);
public sealed record PurchaseCreditNoteDto(Guid Id, string NoteNature, bool AffectsInventory, string InventoryEffect, PurchaseCreditNoteSourceReferenceDto SourceRef, PurchaseCreditNoteDocumentDto Document, PurchaseCreditNoteVendorInformationDto VendorInformation, PurchaseCreditNoteFinancialDetailsDto FinancialDetails, PurchaseCreditNoteProductInformationDto ProductInformation, PurchaseCreditNoteGeneralDto General, IReadOnlyList<PurchaseCreditNoteLineItemDto> Items, IReadOnlyList<PurchaseCreditNoteAdditionDto> Additions, PurchaseCreditNoteFooterDto Footer, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc)
{
    public static PurchaseCreditNoteDto FromEntity(PurchaseCreditNote purchaseCreditNote)
    {
        return new PurchaseCreditNoteDto(
            purchaseCreditNote.Id,
            AdjustmentNoteConventions.ToNatureLabel(purchaseCreditNote.NoteNature),
            purchaseCreditNote.AffectsInventory,
            AdjustmentNoteConventions.ToInventoryEffectLabel(purchaseCreditNote.InventoryEffect),
            new PurchaseCreditNoteSourceReferenceDto(
                purchaseCreditNote.SourceRef.ReferenceId,
                purchaseCreditNote.SourceRef.ReferenceNo),
            new PurchaseCreditNoteDocumentDto(
                purchaseCreditNote.Document.VoucherType,
                purchaseCreditNote.Document.No,
                purchaseCreditNote.Document.Date,
                purchaseCreditNote.Document.DueDate),
            new PurchaseCreditNoteVendorInformationDto(
                purchaseCreditNote.VendorInformation.VendorId,
                purchaseCreditNote.VendorInformation.VendorNameSnapshot,
                purchaseCreditNote.VendorInformation.Address,
                purchaseCreditNote.VendorInformation.Attention,
                purchaseCreditNote.VendorInformation.Phone),
            new PurchaseCreditNoteFinancialDetailsDto(
                ToPaymentModeLabel(purchaseCreditNote.FinancialDetails.PaymentMode),
                purchaseCreditNote.FinancialDetails.SupplierInvoiceNo,
                purchaseCreditNote.FinancialDetails.LrNo,
                purchaseCreditNote.FinancialDetails.CurrencyId,
                purchaseCreditNote.FinancialDetails.CurrencyCodeSnapshot,
                purchaseCreditNote.FinancialDetails.CurrencySymbolSnapshot),
            new PurchaseCreditNoteProductInformationDto(
                purchaseCreditNote.ProductInformation.VendorProducts,
                purchaseCreditNote.ProductInformation.OwnProductsOnly),
            new PurchaseCreditNoteGeneralDto(
                purchaseCreditNote.General.Notes,
                purchaseCreditNote.General.SearchBarcode,
                purchaseCreditNote.General.Taxable,
                ToTaxApplicationLabel(purchaseCreditNote.General.TaxApplication),
                purchaseCreditNote.General.InterState,
                purchaseCreditNote.General.TaxOnFoc),
            purchaseCreditNote.Items
                .OrderBy(item => item.Sno)
                .ThenBy(item => item.Id)
                .Select(item => new PurchaseCreditNoteLineItemDto(
                    item.Id,
                    item.PurchaseCreditNoteId,
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
            purchaseCreditNote.Additions
                .OrderBy(item => item.Id)
                .Select(item => new PurchaseCreditNoteAdditionDto(
                    item.Id,
                    ToAdditionTypeLabel(item.Type),
                    item.LedgerId,
                    item.LedgerNameSnapshot,
                    item.Description,
                    item.Amount))
                .ToList(),
            new PurchaseCreditNoteFooterDto(
                purchaseCreditNote.Footer.Notes,
                purchaseCreditNote.Footer.Total,
                purchaseCreditNote.Footer.Discount,
                purchaseCreditNote.Footer.Addition,
                purchaseCreditNote.Footer.Deduction,
                purchaseCreditNote.Footer.NetTotal),
            ToStatusLabel(purchaseCreditNote.Status),
            purchaseCreditNote.CreatedAtUtc,
            purchaseCreditNote.UpdatedAtUtc);
    }

    private static string ToPaymentModeLabel(PurchaseCreditNotePaymentMode value) => value switch
    {
        PurchaseCreditNotePaymentMode.Cash => "Cash",
        _ => "Credit"
    };

    private static string ToTaxApplicationLabel(PurchaseCreditNoteTaxApplication value) => value switch
    {
        PurchaseCreditNoteTaxApplication.BeforeDiscount => "Before Discount",
        _ => "After Discount"
    };

    private static string ToAdditionTypeLabel(PurchaseCreditNoteAdditionType value) => value switch
    {
        PurchaseCreditNoteAdditionType.Deduction => "Deduction",
        _ => "Addition"
    };

    private static string ToStatusLabel(PurchaseCreditNoteStatus value) => value switch
    {
        PurchaseCreditNoteStatus.Submitted => "Submitted",
        PurchaseCreditNoteStatus.Cancelled => "Cancelled",
        _ => "Draft"
    };
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
