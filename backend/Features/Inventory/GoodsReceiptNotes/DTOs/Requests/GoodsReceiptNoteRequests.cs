namespace backend.Features.Inventory.GoodsReceiptNotes;

public sealed record GoodsReceiptNoteSourceReferenceRequest(string Mode, Guid? PurchaseOrderId, string? PurchaseOrderNo, string? DirectLpoNo, string? DirectVendorInvoiceNo);
public sealed record GoodsReceiptNoteDocumentRequest(string VoucherType, string No, DateOnly Date, DateOnly? DeliveryDate);
public sealed record GoodsReceiptNoteVendorInformationRequest(Guid VendorId, string VendorNameSnapshot, string Address, string? Attention, string? Phone);
public sealed record GoodsReceiptNoteLogisticsRequest(string? LrService, string? LrNo, DateOnly? LrDate);
public sealed record GoodsReceiptNoteGeneralRequest(bool OwnProductsOnly, string TaxableMode, string? Notes);
public sealed record GoodsReceiptNoteLineItemRequest(int SerialNo, Guid ProductId, string? ProductNameSnapshot, string? HsnCode, string? Code, string? Ubc, Guid UnitId, Guid? WarehouseId, decimal FRate, decimal Rate, decimal Quantity, decimal FocQuantity, decimal DiscountPercent, DateOnly? ManufacturingDateUtc, DateOnly? ExpiryDateUtc, string? Remark, decimal SellingRate, Guid? PurchaseOrderLineId);
public sealed record GoodsReceiptNoteFooterRequest(decimal Addition, decimal DiscountFooter, decimal RoundOff);
public sealed record CreateGoodsReceiptNoteRequest(GoodsReceiptNoteSourceReferenceRequest SourceRef, GoodsReceiptNoteDocumentRequest Document, GoodsReceiptNoteVendorInformationRequest VendorInformation, GoodsReceiptNoteLogisticsRequest Logistics, GoodsReceiptNoteGeneralRequest General, IReadOnlyList<GoodsReceiptNoteLineItemRequest> Items, GoodsReceiptNoteFooterRequest Footer);
public sealed record UpdateGoodsReceiptNoteRequest(GoodsReceiptNoteSourceReferenceRequest SourceRef, GoodsReceiptNoteDocumentRequest Document, GoodsReceiptNoteVendorInformationRequest VendorInformation, GoodsReceiptNoteLogisticsRequest Logistics, GoodsReceiptNoteGeneralRequest General, IReadOnlyList<GoodsReceiptNoteLineItemRequest> Items, GoodsReceiptNoteFooterRequest Footer, string? Status);
