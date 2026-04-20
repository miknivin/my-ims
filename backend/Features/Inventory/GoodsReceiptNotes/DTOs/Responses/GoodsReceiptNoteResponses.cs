namespace backend.Features.Inventory.GoodsReceiptNotes;

public sealed record GoodsReceiptNoteSourceReferenceDto(string Mode, Guid? PurchaseOrderId, string? PurchaseOrderNo, string? DirectLpoNo, string? DirectVendorInvoiceNo);
public sealed record GoodsReceiptNoteDocumentDto(string VoucherType, string No, DateOnly Date, DateOnly? DeliveryDate);
public sealed record GoodsReceiptNoteVendorInformationDto(Guid VendorId, string VendorNameSnapshot, string Address, string? Attention, string? Phone);
public sealed record GoodsReceiptNoteLogisticsDto(string? LrService, string? LrNo, DateOnly? LrDate);
public sealed record GoodsReceiptNoteGeneralDto(bool OwnProductsOnly, string TaxableMode, string? Notes);
public sealed record GoodsReceiptNoteLineItemDto(Guid Id, Guid GoodsReceiptNoteId, int SerialNo, Guid ProductId, string ProductNameSnapshot, string? HsnCode, string? Code, string? Ubc, Guid UnitId, string UnitName, Guid? WarehouseId, string? WarehouseName, decimal FRate, decimal Rate, decimal Quantity, decimal FocQuantity, decimal GrossAmount, decimal DiscountPercent, decimal DiscountAmount, decimal TaxableAmount, decimal Total, DateOnly? ManufacturingDateUtc, DateOnly? ExpiryDateUtc, string? Remark, decimal SellingRate, Guid? PurchaseOrderLineId);
public sealed record GoodsReceiptNoteFooterDto(decimal Addition, decimal DiscountFooter, decimal RoundOff, decimal NetTotal, decimal TotalQty, decimal TotalFoc, decimal TotalAmount);
public sealed record GoodsReceiptNoteListItemDto(Guid Id, string No, DateOnly Date, string VendorName, decimal NetTotal, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc);
public sealed record GoodsReceiptNoteDto(Guid Id, GoodsReceiptNoteSourceReferenceDto SourceRef, GoodsReceiptNoteDocumentDto Document, GoodsReceiptNoteVendorInformationDto VendorInformation, GoodsReceiptNoteLogisticsDto Logistics, GoodsReceiptNoteGeneralDto General, IReadOnlyList<GoodsReceiptNoteLineItemDto> Items, GoodsReceiptNoteFooterDto Footer, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc)
{
    public static GoodsReceiptNoteDto FromEntity(GoodsReceiptNote goodsReceiptNote)
    {
        return new GoodsReceiptNoteDto(
            goodsReceiptNote.Id,
            new GoodsReceiptNoteSourceReferenceDto(
                goodsReceiptNote.SourceRef.Mode,
                goodsReceiptNote.SourceRef.PurchaseOrderId,
                goodsReceiptNote.SourceRef.PurchaseOrderNo,
                goodsReceiptNote.SourceRef.DirectLpoNo,
                goodsReceiptNote.SourceRef.DirectVendorInvoiceNo),
            new GoodsReceiptNoteDocumentDto(
                goodsReceiptNote.Document.VoucherType,
                goodsReceiptNote.Document.No,
                goodsReceiptNote.Document.Date,
                goodsReceiptNote.Document.DeliveryDate),
            new GoodsReceiptNoteVendorInformationDto(
                goodsReceiptNote.VendorInformation.VendorId,
                goodsReceiptNote.VendorInformation.VendorNameSnapshot,
                goodsReceiptNote.VendorInformation.Address,
                goodsReceiptNote.VendorInformation.Attention,
                goodsReceiptNote.VendorInformation.Phone),
            new GoodsReceiptNoteLogisticsDto(
                goodsReceiptNote.Logistics.LrService,
                goodsReceiptNote.Logistics.LrNo,
                goodsReceiptNote.Logistics.LrDate),
            new GoodsReceiptNoteGeneralDto(
                goodsReceiptNote.General.OwnProductsOnly,
                goodsReceiptNote.General.TaxableMode,
                goodsReceiptNote.General.Notes),
            goodsReceiptNote.Items
                .OrderBy(item => item.SerialNo)
                .ThenBy(item => item.Id)
                .Select(item => new GoodsReceiptNoteLineItemDto(
                    item.Id,
                    item.GoodsReceiptNoteId,
                    item.SerialNo,
                    item.ProductId,
                    item.ProductNameSnapshot,
                    item.HsnCode,
                    item.Code,
                    item.Ubc,
                    item.UnitId,
                    item.Unit?.Name ?? string.Empty,
                    item.WarehouseId,
                    item.Warehouse?.Name,
                    item.FRate,
                    item.Rate,
                    item.Quantity,
                    item.FocQuantity,
                    item.GrossAmount,
                    item.DiscountPercent,
                    item.DiscountAmount,
                    item.TaxableAmount,
                    item.Total,
                    item.ManufacturingDateUtc,
                    item.ExpiryDateUtc,
                    item.Remark,
                    item.SellingRate,
                    item.PurchaseOrderLineId))
                .ToList(),
            new GoodsReceiptNoteFooterDto(
                goodsReceiptNote.Footer.Addition,
                goodsReceiptNote.Footer.DiscountFooter,
                goodsReceiptNote.Footer.RoundOff,
                goodsReceiptNote.Footer.NetTotal,
                goodsReceiptNote.Footer.TotalQty,
                goodsReceiptNote.Footer.TotalFoc,
                goodsReceiptNote.Footer.TotalAmount),
            goodsReceiptNote.Status,
            goodsReceiptNote.CreatedAtUtc,
            goodsReceiptNote.UpdatedAtUtc);
    }
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
