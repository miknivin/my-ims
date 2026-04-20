namespace backend.Features.Transactions.PurchaseOrders;

public sealed record PurchaseOrderOrderDetailsRequest(string VoucherType, string No, DateOnly Date, DateOnly DueDate, DateOnly DeliveryDate);
public sealed record PurchaseOrderVendorInformationRequest(Guid VendorId, string VendorLabel, string Address, string? Attention, string? Phone);
public sealed record PurchaseOrderFinancialDetailsRequest(string PaymentMode, decimal CreditLimit, Guid? CurrencyId, string? CurrencyLabel, decimal Balance);
public sealed record PurchaseOrderDeliveryInformationRequest(Guid? WarehouseId, string? WarehouseName, string Address, string? Attention, string? Phone);
public sealed record PurchaseOrderProductInformationRequest(string VendorProducts, bool OwnProductsOnly, string? Reference, string? MrNo);
public sealed record PurchaseOrderLineItemRequest(Guid ItemId, string ItemNameSnapshot, string? HsnCode, decimal Quantity, Guid UnitId, decimal Rate, string DiscountType, decimal DiscountValue, decimal CgstRate, decimal SgstRate, decimal IgstRate, Guid? WarehouseId, decimal ReceivedQty);
public sealed record PurchaseOrderAdditionRequest(string Type, Guid? LedgerId, string? LedgerName, string? Description, decimal Amount);
public sealed record PurchaseOrderFooterRequest(string? Notes, string? Remarks, bool Taxable, decimal Addition, decimal Advance);
public sealed record CreatePurchaseOrderRequest(PurchaseOrderOrderDetailsRequest OrderDetails, PurchaseOrderVendorInformationRequest VendorInformation, PurchaseOrderFinancialDetailsRequest FinancialDetails, PurchaseOrderDeliveryInformationRequest DeliveryInformation, PurchaseOrderProductInformationRequest ProductInformation, IReadOnlyList<PurchaseOrderLineItemRequest> Items, IReadOnlyList<PurchaseOrderAdditionRequest> Additions, PurchaseOrderFooterRequest Footer);
public sealed record UpdatePurchaseOrderRequest(PurchaseOrderOrderDetailsRequest OrderDetails, PurchaseOrderVendorInformationRequest VendorInformation, PurchaseOrderFinancialDetailsRequest FinancialDetails, PurchaseOrderDeliveryInformationRequest DeliveryInformation, PurchaseOrderProductInformationRequest ProductInformation, IReadOnlyList<PurchaseOrderLineItemRequest> Items, IReadOnlyList<PurchaseOrderAdditionRequest> Additions, PurchaseOrderFooterRequest Footer, string? Status);
