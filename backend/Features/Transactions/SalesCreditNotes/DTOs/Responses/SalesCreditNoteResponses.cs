using backend.Features.Transactions;

namespace backend.Features.Transactions.SalesCreditNotes;

public sealed record SalesCreditNoteSourceReferenceDto(Guid? ReferenceId, string ReferenceNo);
public sealed record SalesCreditNoteDocumentDto(string VoucherType, string No, DateOnly Date, DateOnly DueDate);
public sealed record SalesCreditNoteCustomerInformationDto(Guid CustomerId, string CustomerNameSnapshot, string Address);
public sealed record SalesCreditNoteFinancialDetailsDto(string PaymentMode, string? InvoiceNo, string? LrNo, Guid? CurrencyId, string? CurrencyCodeSnapshot, string? CurrencySymbolSnapshot, decimal Balance);
public sealed record SalesCreditNoteGeneralDto(string? Notes, bool Taxable, string TaxApplication, bool InterState);
public sealed record SalesCreditNoteLineItemDto(Guid Id, Guid SalesCreditNoteId, Guid SourceLineId, int Sno, Guid ProductId, string? ProductCodeSnapshot, string ProductNameSnapshot, string? HsnCode, Guid UnitId, string UnitName, decimal Quantity, decimal Rate, decimal GrossAmount, decimal DiscountPercent, decimal DiscountAmount, decimal TaxableAmount, decimal TaxPercent, decimal TaxAmount, decimal CostRate, decimal CogsAmount, decimal GrossProfitAmount, decimal LineTotal, Guid? WarehouseId, string? WarehouseName);
public sealed record SalesCreditNoteAdditionDto(Guid Id, string Type, Guid? LedgerId, string LedgerNameSnapshot, string? Description, decimal Amount);
public sealed record SalesCreditNoteFooterDto(string? Notes, decimal Total, decimal Addition, decimal Deduction, decimal Paid, decimal NetTotal);
public sealed record SalesCreditNoteListItemDto(Guid Id, string No, DateOnly Date, string CounterpartyName, decimal NetTotal, string NoteNature, string InventoryEffect, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc);
public sealed record SalesCreditNoteDto(Guid Id, string NoteNature, bool AffectsInventory, string InventoryEffect, SalesCreditNoteSourceReferenceDto SourceRef, SalesCreditNoteDocumentDto Document, SalesCreditNoteCustomerInformationDto CustomerInformation, SalesCreditNoteFinancialDetailsDto FinancialDetails, SalesCreditNoteGeneralDto General, IReadOnlyList<SalesCreditNoteLineItemDto> Items, IReadOnlyList<SalesCreditNoteAdditionDto> Additions, SalesCreditNoteFooterDto Footer, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc)
{
    public static SalesCreditNoteDto FromEntity(SalesCreditNote salesCreditNote)
    {
        return new SalesCreditNoteDto(
            salesCreditNote.Id,
            AdjustmentNoteConventions.ToNatureLabel(salesCreditNote.NoteNature),
            salesCreditNote.AffectsInventory,
            AdjustmentNoteConventions.ToInventoryEffectLabel(salesCreditNote.InventoryEffect),
            new SalesCreditNoteSourceReferenceDto(
                salesCreditNote.SourceRef.ReferenceId,
                salesCreditNote.SourceRef.ReferenceNo),
            new SalesCreditNoteDocumentDto(
                salesCreditNote.Document.VoucherType,
                salesCreditNote.Document.No,
                salesCreditNote.Document.Date,
                salesCreditNote.Document.DueDate),
            new SalesCreditNoteCustomerInformationDto(
                salesCreditNote.CustomerInformation.CustomerId,
                salesCreditNote.CustomerInformation.CustomerNameSnapshot,
                salesCreditNote.CustomerInformation.Address),
            new SalesCreditNoteFinancialDetailsDto(
                ToPaymentModeLabel(salesCreditNote.FinancialDetails.PaymentMode),
                salesCreditNote.FinancialDetails.InvoiceNo,
                salesCreditNote.FinancialDetails.LrNo,
                salesCreditNote.FinancialDetails.CurrencyId,
                salesCreditNote.FinancialDetails.CurrencyCodeSnapshot,
                salesCreditNote.FinancialDetails.CurrencySymbolSnapshot,
                salesCreditNote.FinancialDetails.Balance),
            new SalesCreditNoteGeneralDto(
                salesCreditNote.General.Notes,
                salesCreditNote.General.Taxable,
                ToTaxApplicationLabel(salesCreditNote.General.TaxApplication),
                salesCreditNote.General.InterState),
            salesCreditNote.Items
                .OrderBy(item => item.Sno)
                .ThenBy(item => item.Id)
                .Select(item => new SalesCreditNoteLineItemDto(
                    item.Id,
                    item.SalesCreditNoteId,
                    item.SourceLineId,
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
            salesCreditNote.Additions
                .OrderBy(item => item.Id)
                .Select(item => new SalesCreditNoteAdditionDto(
                    item.Id,
                    ToAdditionTypeLabel(item.Type),
                    item.LedgerId,
                    item.LedgerNameSnapshot,
                    item.Description,
                    item.Amount))
                .ToList(),
            new SalesCreditNoteFooterDto(
                salesCreditNote.Footer.Notes,
                salesCreditNote.Footer.Total,
                salesCreditNote.Footer.Addition,
                salesCreditNote.Footer.Deduction,
                salesCreditNote.Footer.Paid,
                salesCreditNote.Footer.NetTotal),
            ToStatusLabel(salesCreditNote.Status),
            salesCreditNote.CreatedAtUtc,
            salesCreditNote.UpdatedAtUtc);
    }

    private static string ToPaymentModeLabel(SalesCreditNotePaymentMode value) => value switch
    {
        SalesCreditNotePaymentMode.Credit => "Credit",
        _ => "Cash"
    };

    private static string ToTaxApplicationLabel(SalesCreditNoteTaxApplication value) => value switch
    {
        SalesCreditNoteTaxApplication.BeforeDiscount => "Before Discount",
        _ => "After Discount"
    };

    private static string ToAdditionTypeLabel(SalesCreditNoteAdditionType value) => value switch
    {
        SalesCreditNoteAdditionType.Deduction => "Deduction",
        _ => "Addition"
    };

    private static string ToStatusLabel(SalesCreditNoteStatus value) => value switch
    {
        SalesCreditNoteStatus.Submitted => "Submitted",
        SalesCreditNoteStatus.Cancelled => "Cancelled",
        _ => "Draft"
    };
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
