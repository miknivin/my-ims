using backend.Features.Masters.Currencies;
using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Vendors;
using backend.Features.Masters.Warehouses;
using backend.Features.Transactions;

namespace backend.Features.Transactions.PurchaseOrders;

public static class PurchaseOrderStatuses
{
    public const string Draft = "Draft";
    public const string Submitted = "Submitted";
    public const string Cancelled = "Cancelled";

    public static readonly string[] All = [Draft, Submitted, Cancelled];
}

public static class PurchaseOrderPaymentModes
{
    public const string Cash = "Cash";
    public const string Credit = "Credit";

    public static readonly string[] All = [Cash, Credit];
}

public static class PurchaseOrderDiscountTypes
{
    public const string Percentage = "percentage";
    public const string Fixed = "fixed";

    public static readonly string[] All = [Percentage, Fixed];
}

public static class PurchaseOrderAdditionTypes
{
    public const string Addition = "Addition";
    public const string Deduction = "Deduction";

    public static readonly string[] All = [Addition, Deduction];
}

public sealed class PurchaseOrder
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public PurchaseOrderOrderDetails OrderDetails { get; set; } = new();
    public PurchaseOrderVendorInformation VendorInformation { get; set; } = new();
    public PurchaseOrderFinancialDetails FinancialDetails { get; set; } = new();
    public PurchaseOrderDeliveryInformation DeliveryInformation { get; set; } = new();
    public PurchaseOrderProductInformation ProductInformation { get; set; } = new();
    public List<PurchaseOrderLineItem> Items { get; set; } = [];
    public List<PurchaseOrderAddition> Additions { get; set; } = [];
    public PurchaseOrderFooter Footer { get; set; } = new();
    public string Status { get; set; } = PurchaseOrderStatuses.Draft;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class PurchaseOrderOrderDetails
{
    public string VoucherType { get; set; } = "PO";
    public string No { get; set; } = string.Empty;
    public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly DueDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly DeliveryDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
}

public sealed class PurchaseOrderVendorInformation
{
    public Guid VendorId { get; set; }
    public Vendor? Vendor { get; set; }
    public string VendorNameSnapshot { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Attention { get; set; }
    public string? Phone { get; set; }
}

public sealed class PurchaseOrderFinancialDetails
{
    public string PaymentMode { get; set; } = PurchaseOrderPaymentModes.Cash;
    public decimal CreditLimit { get; set; }
    public Guid? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public string? CurrencyLabelSnapshot { get; set; }
    public decimal Balance { get; set; }
}

public sealed class PurchaseOrderDeliveryInformation
{
    public Guid? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public string? WarehouseNameSnapshot { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? Attention { get; set; }
    public string? Phone { get; set; }
}

public sealed class PurchaseOrderProductInformation
{
    public string VendorProducts { get; set; } = "Re-Order Level";
    public bool OwnProductsOnly { get; set; }
    public string? Reference { get; set; }
    public string? MrNo { get; set; }
}

public sealed class PurchaseOrderAddition
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Type { get; set; } = PurchaseOrderAdditionTypes.Addition;
    public Guid? LedgerId { get; set; }
    public Ledger? Ledger { get; set; }
    public string LedgerNameSnapshot { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
}

public sealed class PurchaseOrderFooter
{
    public string? Notes { get; set; }
    public string? Remarks { get; set; }
    public bool Taxable { get; set; } = true;
    public decimal Addition { get; set; }
    public decimal Advance { get; set; }
    public decimal Total { get; set; }
    public decimal Discount { get; set; }
    public decimal Tax { get; set; }
    public decimal NetTotal { get; set; }
}

public sealed class PurchaseOrderLineItem : LineItemBase
{
    public Guid PurchaseOrderId { get; set; }
    public PurchaseOrder? PurchaseOrder { get; set; }
    public string DiscountType { get; set; } = PurchaseOrderDiscountTypes.Percentage;
    public decimal DiscountValue { get; set; }
    public decimal CgstRate { get; set; }
    public decimal CgstAmount { get; set; }
    public decimal SgstRate { get; set; }
    public decimal SgstAmount { get; set; }
    public decimal IgstRate { get; set; }
    public decimal IgstAmount { get; set; }
    public decimal LineTotal { get; set; }
    public decimal ReceivedQty { get; set; }
}
