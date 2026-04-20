using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Taxes;
using backend.Features.Masters.Vendors;

namespace backend.Features.Masters.Customers;

public static class CustomerStatuses
{
    public const string Active = "Active";
    public const string Inactive = "Inactive";

    public static readonly string[] All = [Active, Inactive];
}

public static class CustomerTypes
{
    public const string WalkIn = "Walk-in";
    public const string Regular = "Regular";
    public const string Wholesale = "Wholesale";
    public const string Distributor = "Distributor";
    public const string Dealer = "Dealer";
    public const string Retail = "Retail";
    public const string Corporate = "Corporate";
    public const string Government = "Government";

    public static readonly string[] All =
    [
        WalkIn,
        Regular,
        Wholesale,
        Distributor,
        Dealer,
        Retail,
        Corporate,
        Government
    ];
}

public static class CustomerPriceLevels
{
    public const string WRate = "WRATE";
    public const string RRate = "RRATE";
    public const string MRate = "MRATE";
    public const string Special = "Special";

    public static readonly string[] All = [WRate, RRate, MRate, Special];
}

public static class CustomerTaxTypes
{
    public const string Gst = "GST";
    public const string Tds = "TDS";
    public const string Tcs = "TCS";
    public const string Other = "Other";

    public static readonly string[] All = [Gst, Tds, Tcs, Other];
}

public static class CustomerFilingFrequencies
{
    public const string Monthly = "Monthly";
    public const string Quarterly = "Quarterly";

    public static readonly string[] All = [Monthly, Quarterly];
}

public sealed class Customer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public CustomerBasicDetails BasicDetails { get; set; } = new();
    public Guid? LedgerId { get; set; }
    public Ledger? Ledger { get; set; }
    public CustomerContact Contact { get; set; } = new();
    public CustomerBillingAddress BillingAddress { get; set; } = new();
    public List<CustomerShippingAddress> ShippingAddresses { get; set; } = [];
    public List<CustomerTaxDocument> TaxDocuments { get; set; } = [];
    public CustomerFinancials Financials { get; set; } = new();
    public CustomerSalesAndPricing SalesAndPricing { get; set; } = new();
    public CustomerStatusDetails StatusDetails { get; set; } = new();
    public string Status { get; set; } = CustomerStatuses.Active;
    public CustomerOpeningBalance? OpeningBalance { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class CustomerBasicDetails
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Alias { get; set; }
    public string CustomerType { get; set; } = CustomerTypes.Regular;
    public string? Category { get; set; }
}

public sealed class CustomerContact
{
    public string? Phone { get; set; }
    public string? Mobile { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
}

public sealed class CustomerBillingAddress
{
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }
    public string? Country { get; set; }
}

public sealed class CustomerShippingAddress
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? Name { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }
    public string? Country { get; set; }
    public bool IsDefault { get; set; }
}

public sealed class CustomerTaxDocument
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TaxType { get; set; } = CustomerTaxTypes.Gst;
    public string Number { get; set; } = string.Empty;
    public bool Verified { get; set; }
    public DateOnly? VerifiedAt { get; set; }
    public string? State { get; set; }
    public string? FilingFrequency { get; set; }
    public DateOnly EffectiveFrom { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly? EffectiveTo { get; set; }
}

public sealed class CustomerFinancials
{
    public decimal? CreditLimit { get; set; }
    public int? CreditDays { get; set; }
}

public sealed class CustomerSalesAndPricing
{
    public Guid? DefaultTaxId { get; set; }
    public Tax? DefaultTax { get; set; }
    public string PriceLevel { get; set; } = CustomerPriceLevels.RRate;
}

public sealed class CustomerStatusDetails
{
    public string? Remarks { get; set; }
}

public sealed class CustomerOpeningBalance
{
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public decimal Amount { get; set; }
    public string BalanceType { get; set; } = BalanceTypes.Dr;
    public DateOnly AsOfDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
