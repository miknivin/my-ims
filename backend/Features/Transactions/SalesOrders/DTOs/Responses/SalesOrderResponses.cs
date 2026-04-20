namespace backend.Features.Transactions.SalesOrders;

public sealed record SalesOrderOrderDetailsDto(string VoucherType, string No, DateOnly Date, DateOnly? DeliveryDate);
public sealed record SalesOrderPartyInformationDto(Guid CustomerId, string CustomerNameSnapshot, string? CustomerCodeSnapshot, string? Address, string? Attention);
public sealed record SalesOrderCommercialDetailsDto(string RateLevel, Guid? CurrencyId, string? CurrencyCodeSnapshot, string? CurrencySymbolSnapshot, decimal? CreditLimit, bool IsInterState, string TaxApplication);
public sealed record SalesOrderSalesDetailsDto(Guid? SalesManId, string? SalesManNameSnapshot);
public sealed record SalesOrderLineItemDto(Guid Id, Guid SalesOrderId, int Sno, Guid ProductId, string ProductNameSnapshot, string? HsnCode, Guid UnitId, string UnitName, decimal Quantity, decimal Foc, decimal Mrp, decimal Rate, decimal GrossAmount, decimal DiscountPercent, decimal DiscountAmount, decimal TaxableAmount, decimal TaxPercent, decimal TaxAmount, decimal NetAmount, Guid? WarehouseId, string? WarehouseName);
public sealed record SalesOrderAdditionDto(Guid Id, string Type, Guid? LedgerId, string LedgerNameSnapshot, string? Description, decimal Amount);
public sealed record SalesOrderFooterDto(string? VehicleNo, decimal Total, decimal Discount, decimal Freight, decimal SoAdvance, decimal RoundOff, decimal NetTotal, decimal Balance, string? Remarks);
public sealed record SalesOrderListItemDto(Guid Id, string No, DateOnly Date, string CustomerName, decimal NetTotal, string Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc);
public sealed record SalesOrderDto(Guid Id, SalesOrderOrderDetailsDto OrderDetails, SalesOrderPartyInformationDto PartyInformation, SalesOrderCommercialDetailsDto CommercialDetails, SalesOrderSalesDetailsDto SalesDetails, IReadOnlyList<SalesOrderLineItemDto> Items, IReadOnlyList<SalesOrderAdditionDto> Additions, SalesOrderFooterDto Footer, string Status, Guid CreatedById, Guid? UpdatedById, DateTime CreatedAtUtc, DateTime UpdatedAtUtc)
{
    public static SalesOrderDto FromEntity(SalesOrder salesOrder)
    {
        return new SalesOrderDto(
            salesOrder.Id,
            new SalesOrderOrderDetailsDto(
                salesOrder.OrderDetails.VoucherType,
                salesOrder.OrderDetails.No,
                salesOrder.OrderDetails.Date,
                salesOrder.OrderDetails.DeliveryDate),
            new SalesOrderPartyInformationDto(
                salesOrder.PartyInformation.CustomerId,
                salesOrder.PartyInformation.CustomerNameSnapshot,
                salesOrder.PartyInformation.CustomerCodeSnapshot,
                salesOrder.PartyInformation.Address,
                salesOrder.PartyInformation.Attention),
            new SalesOrderCommercialDetailsDto(
                salesOrder.CommercialDetails.RateLevel,
                salesOrder.CommercialDetails.CurrencyId,
                salesOrder.CommercialDetails.CurrencyCodeSnapshot,
                salesOrder.CommercialDetails.CurrencySymbolSnapshot,
                salesOrder.CommercialDetails.CreditLimit,
                salesOrder.CommercialDetails.IsInterState,
                salesOrder.CommercialDetails.TaxApplication),
            new SalesOrderSalesDetailsDto(
                salesOrder.SalesDetails.SalesManId,
                salesOrder.SalesDetails.SalesManNameSnapshot),
            salesOrder.Items
                .OrderBy(item => item.Sno)
                .ThenBy(item => item.Id)
                .Select(item => new SalesOrderLineItemDto(
                    item.Id,
                    item.SalesOrderId,
                    item.Sno,
                    item.ProductId,
                    item.ProductNameSnapshot,
                    item.HsnCode,
                    item.UnitId,
                    item.Unit?.Name ?? string.Empty,
                    item.Quantity,
                    item.Foc,
                    item.Mrp,
                    item.Rate,
                    item.GrossAmount,
                    item.DiscountPercent,
                    item.DiscountAmount,
                    item.TaxableAmount,
                    item.TaxPercent,
                    item.TaxAmount,
                    item.NetAmount,
                    item.WarehouseId,
                    item.Warehouse?.Name))
                .ToList(),
            salesOrder.Additions
                .OrderBy(item => item.Id)
                .Select(item => new SalesOrderAdditionDto(
                    item.Id,
                    item.Type,
                    item.LedgerId,
                    item.LedgerNameSnapshot,
                    item.Description,
                    item.Amount))
                .ToList(),
            new SalesOrderFooterDto(
                salesOrder.Footer.VehicleNo,
                salesOrder.Footer.Total,
                salesOrder.Footer.Discount,
                salesOrder.Footer.Freight,
                salesOrder.Footer.SoAdvance,
                salesOrder.Footer.RoundOff,
                salesOrder.Footer.NetTotal,
                salesOrder.Footer.Balance,
                salesOrder.Footer.Remarks),
            salesOrder.Status,
            salesOrder.CreatedById,
            salesOrder.UpdatedById,
            salesOrder.CreatedAtUtc,
            salesOrder.UpdatedAtUtc);
    }
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
