namespace backend.Features.Transactions.PurchaseOrders;

public sealed record PurchaseOrderOrderDetailsDto(string VoucherType, string No, DateOnly Date, DateOnly DueDate, DateOnly DeliveryDate);
public sealed record PurchaseOrderVendorInformationDto(Guid VendorId, string VendorNameSnapshot, string Address, string? Attention, string? Phone);
public sealed record PurchaseOrderFinancialDetailsDto(string PaymentMode, decimal CreditLimit, Guid? CurrencyId, string? CurrencyLabelSnapshot, decimal Balance);
public sealed record PurchaseOrderDeliveryInformationDto(Guid? WarehouseId, string? WarehouseNameSnapshot, string Address, string? Attention, string? Phone);
public sealed record PurchaseOrderProductInformationDto(string VendorProducts, bool OwnProductsOnly, string? Reference, string? MrNo);
public sealed record PurchaseOrderLineItemDto(Guid Id, Guid PurchaseOrderId, Guid ItemId, string ItemNameSnapshot, string? HsnCode, decimal Quantity, Guid UnitId, string UnitName, decimal Rate, decimal GrossAmount, string DiscountType, decimal DiscountValue, decimal DiscountAmount, decimal TaxableAmount, decimal CgstRate, decimal CgstAmount, decimal SgstRate, decimal SgstAmount, decimal IgstRate, decimal IgstAmount, decimal LineTotal, Guid? WarehouseId, string? WarehouseName, decimal ReceivedQty);
public sealed record PurchaseOrderAdditionDto(Guid Id, string Type, Guid? LedgerId, string LedgerNameSnapshot, string? Description, decimal Amount);
public sealed record PurchaseOrderFooterDto(string? Notes, string? Remarks, bool Taxable, decimal Addition, decimal Advance, decimal Total, decimal Discount, decimal Tax, decimal NetTotal);
public sealed record PurchaseOrderListItemDto(Guid Id, string No, DateOnly Date, string VendorName, decimal NetTotal, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc);
public sealed record PurchaseOrderDto(Guid Id, PurchaseOrderOrderDetailsDto OrderDetails, PurchaseOrderVendorInformationDto VendorInformation, PurchaseOrderFinancialDetailsDto FinancialDetails, PurchaseOrderDeliveryInformationDto DeliveryInformation, PurchaseOrderProductInformationDto ProductInformation, IReadOnlyList<PurchaseOrderLineItemDto> Items, IReadOnlyList<PurchaseOrderAdditionDto> Additions, PurchaseOrderFooterDto Footer, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc)
{
    public static PurchaseOrderDto FromEntity(PurchaseOrder purchaseOrder)
    {
        return new PurchaseOrderDto(
            purchaseOrder.Id,
            new PurchaseOrderOrderDetailsDto(
                purchaseOrder.OrderDetails.VoucherType,
                purchaseOrder.OrderDetails.No,
                purchaseOrder.OrderDetails.Date,
                purchaseOrder.OrderDetails.DueDate,
                purchaseOrder.OrderDetails.DeliveryDate),
            new PurchaseOrderVendorInformationDto(
                purchaseOrder.VendorInformation.VendorId,
                purchaseOrder.VendorInformation.VendorNameSnapshot,
                purchaseOrder.VendorInformation.Address,
                purchaseOrder.VendorInformation.Attention,
                purchaseOrder.VendorInformation.Phone),
            new PurchaseOrderFinancialDetailsDto(
                purchaseOrder.FinancialDetails.PaymentMode,
                purchaseOrder.FinancialDetails.CreditLimit,
                purchaseOrder.FinancialDetails.CurrencyId,
                purchaseOrder.FinancialDetails.CurrencyLabelSnapshot,
                purchaseOrder.FinancialDetails.Balance),
            new PurchaseOrderDeliveryInformationDto(
                purchaseOrder.DeliveryInformation.WarehouseId,
                purchaseOrder.DeliveryInformation.WarehouseNameSnapshot,
                purchaseOrder.DeliveryInformation.Address,
                purchaseOrder.DeliveryInformation.Attention,
                purchaseOrder.DeliveryInformation.Phone),
            new PurchaseOrderProductInformationDto(
                purchaseOrder.ProductInformation.VendorProducts,
                purchaseOrder.ProductInformation.OwnProductsOnly,
                purchaseOrder.ProductInformation.Reference,
                purchaseOrder.ProductInformation.MrNo),
            purchaseOrder.Items
                .OrderBy(item => item.Id)
                .Select(item => new PurchaseOrderLineItemDto(
                    item.Id,
                    item.PurchaseOrderId,
                    item.ProductId,
                    item.ProductNameSnapshot,
                    item.HsnCode,
                    item.Quantity,
                    item.UnitId,
                    item.Unit?.Name ?? string.Empty,
                    item.Rate,
                    item.GrossAmount,
                    item.DiscountType,
                    item.DiscountValue,
                    item.DiscountAmount,
                    item.TaxableAmount,
                    item.CgstRate,
                    item.CgstAmount,
                    item.SgstRate,
                    item.SgstAmount,
                    item.IgstRate,
                    item.IgstAmount,
                    item.LineTotal,
                    item.WarehouseId,
                    item.Warehouse?.Name,
                    item.ReceivedQty))
                .ToList(),
            purchaseOrder.Additions
                .OrderBy(item => item.Id)
                .Select(item => new PurchaseOrderAdditionDto(
                    item.Id,
                    item.Type,
                    item.LedgerId,
                    item.LedgerNameSnapshot,
                    item.Description,
                    item.Amount))
                .ToList(),
            new PurchaseOrderFooterDto(
                purchaseOrder.Footer.Notes,
                purchaseOrder.Footer.Remarks,
                purchaseOrder.Footer.Taxable,
                purchaseOrder.Footer.Addition,
                purchaseOrder.Footer.Advance,
                purchaseOrder.Footer.Total,
                purchaseOrder.Footer.Discount,
                purchaseOrder.Footer.Tax,
                purchaseOrder.Footer.NetTotal),
            purchaseOrder.Status,
            purchaseOrder.CreatedAtUtc,
            purchaseOrder.UpdatedAtUtc);
    }
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
