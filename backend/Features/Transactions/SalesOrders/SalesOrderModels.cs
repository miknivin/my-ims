using backend.Features.Auth;
using backend.Features.Masters.Customers;
using backend.Features.Masters.Currencies;
using backend.Features.Masters.Ledgers;
using backend.Features.Transactions;

namespace backend.Features.Transactions.SalesOrders;

public static class SalesOrderStatuses
{
    public const string Draft = "Draft";
    public const string Confirmed = "Confirmed";
    public const string Delivered = "Delivered";
    public const string Cancelled = "Cancelled";
    public const string Invoiced = "Invoiced";

    public static readonly string[] All = [Draft, Confirmed, Delivered, Cancelled, Invoiced];
}

public static class SalesOrderVoucherTypes
{
    public const string Sales = "SL";
    public const string Proforma = "PH";

    public static readonly string[] All = [Sales, Proforma];
}

public static class SalesOrderRateLevels
{
    public const string WRate = "WRATE";
    public const string RRate = "RRATE";
    public const string MRate = "MRATE";

    public static readonly string[] All = [WRate, RRate, MRate];
}

public static class SalesOrderTaxApplications
{
    public const string AfterDiscount = "After Discount";
    public const string BeforeDiscount = "Before Discount";

    public static readonly string[] All = [AfterDiscount, BeforeDiscount];
}

public static class SalesOrderAdditionTypes
{
    public const string Addition = "Addition";
    public const string Deduction = "Deduction";

    public static readonly string[] All = [Addition, Deduction];
}

public sealed class SalesOrder
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public SalesOrderOrderDetails OrderDetails { get; set; } = new();
    public SalesOrderPartyInformation PartyInformation { get; set; } = new();
    public SalesOrderCommercialDetails CommercialDetails { get; set; } = new();
    public SalesOrderSalesDetails SalesDetails { get; set; } = new();
    public List<SalesOrderLineItem> Items { get; set; } = [];
    public List<SalesOrderAddition> Additions { get; set; } = [];
    public SalesOrderFooter Footer { get; set; } = new();
    public string Status { get; set; } = SalesOrderStatuses.Draft;
    public Guid CreatedById { get; set; }
    public User? CreatedBy { get; set; }
    public Guid? UpdatedById { get; set; }
    public User? UpdatedBy { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class SalesOrderOrderDetails
{
    public string VoucherType { get; set; } = SalesOrderVoucherTypes.Sales;
    public string No { get; set; } = string.Empty;
    public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly? DeliveryDate { get; set; }
}

public sealed class SalesOrderPartyInformation
{
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string CustomerNameSnapshot { get; set; } = string.Empty;
    public string? CustomerCodeSnapshot { get; set; }
    public string? Address { get; set; }
    public string? Attention { get; set; }
}

public sealed class SalesOrderCommercialDetails
{
    public string RateLevel { get; set; } = SalesOrderRateLevels.RRate;
    public Guid? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public string? CurrencyCodeSnapshot { get; set; }
    public string? CurrencySymbolSnapshot { get; set; }
    public decimal? CreditLimit { get; set; }
    public bool IsInterState { get; set; }
    public string TaxApplication { get; set; } = SalesOrderTaxApplications.AfterDiscount;
}

public sealed class SalesOrderSalesDetails
{
    public Guid? SalesManId { get; set; }
    public User? SalesMan { get; set; }
    public string? SalesManNameSnapshot { get; set; }
}

public sealed class SalesOrderLineItem : LineItemBase
{
    public Guid SalesOrderId { get; set; }
    public SalesOrder? SalesOrder { get; set; }
    public int Sno { get; set; }
    public decimal Foc { get; set; }
    public decimal Mrp { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal NetAmount { get; set; }
}

public sealed class SalesOrderAddition
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Type { get; set; } = SalesOrderAdditionTypes.Addition;
    public Guid? LedgerId { get; set; }
    public Ledger? Ledger { get; set; }
    public string LedgerNameSnapshot { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
}

public sealed class SalesOrderFooter
{
    public string? VehicleNo { get; set; }
    public decimal Total { get; set; }
    public decimal Discount { get; set; }
    public decimal Freight { get; set; }
    public decimal SoAdvance { get; set; }
    public decimal RoundOff { get; set; }
    public decimal NetTotal { get; set; }
    public decimal Balance { get; set; }
    public string? Remarks { get; set; }
}
