namespace backend.Features.Inventory.DeliveryNotes;

public sealed record DeliveryNoteSourceReferenceRequest(string Mode, Guid? SalesOrderId, string? SalesOrderNo, string? DirectRefNo);
public sealed record DeliveryNoteDocumentRequest(string VoucherType, string No, DateOnly Date, DateOnly? ExpectedDeliveryDate);
public sealed record DeliveryNoteCustomerInformationRequest(Guid CustomerId, string CustomerNameSnapshot, string Address, string? ShippingAddress, string? Attention, string? Phone);
public sealed record DeliveryNoteLogisticsRequest(string? TransportMode, string? LrNo, DateOnly? LrDate, string? VehicleNo);
public sealed record DeliveryNoteGeneralRequest(string? Notes);
public sealed record DeliveryNoteLineItemRequest(int SerialNo, Guid ProductId, string? ProductNameSnapshot, string? HsnCode, Guid UnitId, Guid? WarehouseId, decimal Rate, decimal Quantity, decimal DiscountPercent, string? Remark, Guid? SalesOrderLineId);
public sealed record DeliveryNoteFooterRequest();
public sealed record CreateDeliveryNoteRequest(DeliveryNoteSourceReferenceRequest SourceRef, DeliveryNoteDocumentRequest Document, DeliveryNoteCustomerInformationRequest CustomerInformation, DeliveryNoteLogisticsRequest Logistics, DeliveryNoteGeneralRequest General, IReadOnlyList<DeliveryNoteLineItemRequest> Items, DeliveryNoteFooterRequest Footer, string? Status);
public sealed record UpdateDeliveryNoteStatusRequest(string? Status);
