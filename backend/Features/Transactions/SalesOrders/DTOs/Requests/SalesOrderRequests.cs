namespace backend.Features.Transactions.SalesOrders;

public sealed record SalesOrderOrderDetailsRequest(string VoucherType, string No, DateOnly Date, DateOnly? DeliveryDate);
public sealed record SalesOrderPartyInformationRequest(Guid CustomerId, string CustomerName, string? CustomerCode, string? Address, string? Attention);
public sealed record SalesOrderCommercialDetailsRequest(string RateLevel, Guid? CurrencyId, string? CurrencyCode, string? CurrencySymbol, decimal? CreditLimit, bool IsInterState, string TaxApplication);
public sealed record SalesOrderSalesDetailsRequest(Guid? SalesManId, string? SalesMan);
public sealed record SalesOrderLineItemRequest(int Sno, Guid ProductId, string ProductNameSnapshot, string? HsnCode, Guid UnitId, decimal Quantity, decimal Foc, decimal Mrp, decimal Rate, decimal GrossAmount, decimal DiscountPercent, decimal DiscountAmount, decimal TaxableAmount, decimal TaxPercent, decimal TaxAmount, decimal NetAmount, Guid? WarehouseId);
public sealed record SalesOrderAdditionRequest(string Type, Guid? LedgerId, string? LedgerName, string? Description, decimal Amount);
public sealed record SalesOrderFooterRequest(string? VehicleNo, decimal Total, decimal Discount, decimal Freight, decimal SoAdvance, decimal RoundOff, decimal NetTotal, decimal Balance, string? Remarks);
public sealed record CreateSalesOrderRequest(SalesOrderOrderDetailsRequest OrderDetails, SalesOrderPartyInformationRequest PartyInformation, SalesOrderCommercialDetailsRequest CommercialDetails, SalesOrderSalesDetailsRequest SalesDetails, IReadOnlyList<SalesOrderLineItemRequest> Items, IReadOnlyList<SalesOrderAdditionRequest> Additions, SalesOrderFooterRequest Footer);
public sealed record UpdateSalesOrderStatusRequest(string? Status);
