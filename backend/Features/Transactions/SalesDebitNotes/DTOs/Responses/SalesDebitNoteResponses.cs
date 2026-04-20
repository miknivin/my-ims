using backend.Features.Transactions;

namespace backend.Features.Transactions.SalesDebitNotes;

public sealed record SalesDebitNoteSourceReferenceDto(Guid? ReferenceId, string ReferenceNo);
public sealed record SalesDebitNoteDocumentDto(string VoucherType, string No, DateOnly Date, DateOnly DueDate);
public sealed record SalesDebitNoteCustomerInformationDto(Guid CustomerId, string CustomerNameSnapshot, string Address);
public sealed record SalesDebitNoteFinancialDetailsDto(string PaymentMode, string? InvoiceNo, string? LrNo, Guid? CurrencyId, string? CurrencyCodeSnapshot, string? CurrencySymbolSnapshot, decimal Balance);
public sealed record SalesDebitNoteGeneralDto(string? Notes, bool Taxable, string TaxApplication, bool InterState);
public sealed record SalesDebitNoteLineItemDto(Guid Id, Guid SalesDebitNoteId, Guid SourceLineId, int Sno, Guid ProductId, string? ProductCodeSnapshot, string ProductNameSnapshot, string? HsnCode, Guid UnitId, string UnitName, decimal Quantity, decimal Rate, decimal GrossAmount, decimal DiscountPercent, decimal DiscountAmount, decimal TaxableAmount, decimal TaxPercent, decimal TaxAmount, decimal CostRate, decimal CogsAmount, decimal GrossProfitAmount, decimal LineTotal, Guid? WarehouseId, string? WarehouseName);
public sealed record SalesDebitNoteAdditionDto(Guid Id, string Type, Guid? LedgerId, string LedgerNameSnapshot, string? Description, decimal Amount);
public sealed record SalesDebitNoteFooterDto(string? Notes, decimal Total, decimal Addition, decimal Deduction, decimal Paid, decimal NetTotal);
public sealed record SalesDebitNoteListItemDto(Guid Id, string No, DateOnly Date, string CounterpartyName, decimal NetTotal, string NoteNature, string InventoryEffect, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc);
public sealed record SalesDebitNoteDto(Guid Id, string NoteNature, bool AffectsInventory, string InventoryEffect, SalesDebitNoteSourceReferenceDto SourceRef, SalesDebitNoteDocumentDto Document, SalesDebitNoteCustomerInformationDto CustomerInformation, SalesDebitNoteFinancialDetailsDto FinancialDetails, SalesDebitNoteGeneralDto General, IReadOnlyList<SalesDebitNoteLineItemDto> Items, IReadOnlyList<SalesDebitNoteAdditionDto> Additions, SalesDebitNoteFooterDto Footer, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc)
{
    public static SalesDebitNoteDto FromEntity(SalesDebitNote salesDebitNote)
    {
        return new SalesDebitNoteDto(
            salesDebitNote.Id,
            AdjustmentNoteConventions.ToNatureLabel(salesDebitNote.NoteNature),
            salesDebitNote.AffectsInventory,
            AdjustmentNoteConventions.ToInventoryEffectLabel(salesDebitNote.InventoryEffect),
            new SalesDebitNoteSourceReferenceDto(
                salesDebitNote.SourceRef.ReferenceId,
                salesDebitNote.SourceRef.ReferenceNo),
            new SalesDebitNoteDocumentDto(
                salesDebitNote.Document.VoucherType,
                salesDebitNote.Document.No,
                salesDebitNote.Document.Date,
                salesDebitNote.Document.DueDate),
            new SalesDebitNoteCustomerInformationDto(
                salesDebitNote.CustomerInformation.CustomerId,
                salesDebitNote.CustomerInformation.CustomerNameSnapshot,
                salesDebitNote.CustomerInformation.Address),
            new SalesDebitNoteFinancialDetailsDto(
                ToPaymentModeLabel(salesDebitNote.FinancialDetails.PaymentMode),
                salesDebitNote.FinancialDetails.InvoiceNo,
                salesDebitNote.FinancialDetails.LrNo,
                salesDebitNote.FinancialDetails.CurrencyId,
                salesDebitNote.FinancialDetails.CurrencyCodeSnapshot,
                salesDebitNote.FinancialDetails.CurrencySymbolSnapshot,
                salesDebitNote.FinancialDetails.Balance),
            new SalesDebitNoteGeneralDto(
                salesDebitNote.General.Notes,
                salesDebitNote.General.Taxable,
                ToTaxApplicationLabel(salesDebitNote.General.TaxApplication),
                salesDebitNote.General.InterState),
            salesDebitNote.Items
                .OrderBy(item => item.Sno)
                .ThenBy(item => item.Id)
                .Select(item => new SalesDebitNoteLineItemDto(
                    item.Id,
                    item.SalesDebitNoteId,
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
            salesDebitNote.Additions
                .OrderBy(item => item.Id)
                .Select(item => new SalesDebitNoteAdditionDto(
                    item.Id,
                    ToAdditionTypeLabel(item.Type),
                    item.LedgerId,
                    item.LedgerNameSnapshot,
                    item.Description,
                    item.Amount))
                .ToList(),
            new SalesDebitNoteFooterDto(
                salesDebitNote.Footer.Notes,
                salesDebitNote.Footer.Total,
                salesDebitNote.Footer.Addition,
                salesDebitNote.Footer.Deduction,
                salesDebitNote.Footer.Paid,
                salesDebitNote.Footer.NetTotal),
            ToStatusLabel(salesDebitNote.Status),
            salesDebitNote.CreatedAtUtc,
            salesDebitNote.UpdatedAtUtc);
    }

    private static string ToPaymentModeLabel(SalesDebitNotePaymentMode value) => value switch
    {
        SalesDebitNotePaymentMode.Credit => "Credit",
        _ => "Cash"
    };

    private static string ToTaxApplicationLabel(SalesDebitNoteTaxApplication value) => value switch
    {
        SalesDebitNoteTaxApplication.BeforeDiscount => "Before Discount",
        _ => "After Discount"
    };

    private static string ToAdditionTypeLabel(SalesDebitNoteAdditionType value) => value switch
    {
        SalesDebitNoteAdditionType.Deduction => "Deduction",
        _ => "Addition"
    };

    private static string ToStatusLabel(SalesDebitNoteStatus value) => value switch
    {
        SalesDebitNoteStatus.Submitted => "Submitted",
        SalesDebitNoteStatus.Cancelled => "Cancelled",
        _ => "Draft"
    };
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
