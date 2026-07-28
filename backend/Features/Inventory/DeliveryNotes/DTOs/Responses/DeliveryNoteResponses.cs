namespace backend.Features.Inventory.DeliveryNotes;

public sealed record DeliveryNoteSourceReferenceDto(string Mode, Guid? SalesOrderId, string? SalesOrderNo, string? DirectRefNo);
public sealed record DeliveryNoteDocumentDto(string VoucherType, string No, DateOnly Date, DateOnly? ExpectedDeliveryDate);
public sealed record DeliveryNoteCustomerInformationDto(Guid CustomerId, string CustomerNameSnapshot, string Address, string? ShippingAddress, string? Attention, string? Phone);
public sealed record DeliveryNoteLogisticsDto(string? TransportMode, string? LrNo, DateOnly? LrDate, string? VehicleNo);
public sealed record DeliveryNoteGeneralDto(string? Notes);
public sealed record DeliveryNoteLineItemDto(Guid Id, Guid DeliveryNoteId, int SerialNo, Guid ProductId, string ProductNameSnapshot, string? HsnCode, Guid UnitId, string UnitName, Guid? WarehouseId, string? WarehouseName, decimal Rate, decimal Quantity, decimal GrossAmount, decimal DiscountPercent, decimal DiscountAmount, decimal TaxableAmount, decimal Total, string? Remark, Guid? SalesOrderLineId);
public sealed record DeliveryNoteFooterDto(decimal NetTotal, decimal TotalQty, decimal TotalAmount);
public sealed record DeliveryNoteListItemDto(Guid Id, string No, DateOnly Date, string CustomerName, decimal NetTotal, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc);

public sealed record DeliveryNoteDto(Guid Id, DeliveryNoteSourceReferenceDto SourceRef, DeliveryNoteDocumentDto Document, DeliveryNoteCustomerInformationDto CustomerInformation, DeliveryNoteLogisticsDto Logistics, DeliveryNoteGeneralDto General, IReadOnlyList<DeliveryNoteLineItemDto> Items, DeliveryNoteFooterDto Footer, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc)
{
    public static DeliveryNoteDto FromEntity(DeliveryNote dn) => new(
        dn.Id,
        new DeliveryNoteSourceReferenceDto(dn.SourceRef.Mode, dn.SourceRef.SalesOrderId, dn.SourceRef.SalesOrderNo, dn.SourceRef.DirectRefNo),
        new DeliveryNoteDocumentDto(dn.Document.VoucherType, dn.Document.No, dn.Document.Date, dn.Document.ExpectedDeliveryDate),
        new DeliveryNoteCustomerInformationDto(dn.CustomerInformation.CustomerId, dn.CustomerInformation.CustomerNameSnapshot, dn.CustomerInformation.Address, dn.CustomerInformation.ShippingAddress, dn.CustomerInformation.Attention, dn.CustomerInformation.Phone),
        new DeliveryNoteLogisticsDto(dn.Logistics.TransportMode, dn.Logistics.LrNo, dn.Logistics.LrDate, dn.Logistics.VehicleNo),
        new DeliveryNoteGeneralDto(dn.General.Notes),
        dn.Items.OrderBy(i => i.SerialNo).ThenBy(i => i.Id).Select(i => new DeliveryNoteLineItemDto(
            i.Id, i.DeliveryNoteId, i.SerialNo, i.ProductId, i.ProductNameSnapshot, i.HsnCode,
            i.UnitId, i.Unit?.Name ?? string.Empty, i.WarehouseId, i.Warehouse?.Name,
            i.Rate, i.Quantity, i.GrossAmount, 0, i.DiscountAmount, i.TaxableAmount, i.Total, i.Remark, i.SalesOrderLineId)).ToList(),
        new DeliveryNoteFooterDto(dn.Footer.NetTotal, dn.Footer.TotalQty, dn.Footer.TotalAmount),
        dn.Status,
        dn.CreatedAtUtc,
        dn.UpdatedAtUtc);
}
