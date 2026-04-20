using backend.Features.Masters.Currencies;
using backend.Features.Masters.Ledgers;

namespace backend.Features.Masters.Vendors;

public static class VendorStatuses
{
    public const string Active = "Active";
    public const string Inactive = "Inactive";

    public static readonly string[] All = [Active, Inactive];
}

public static class BalanceTypes
{
    public const string Dr = "Dr";
    public const string Cr = "Cr";

    public static readonly string[] All = [Dr, Cr];
}

public sealed class Vendor
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public VendorBasicInfo BasicInfo { get; set; } = new();

    public VendorAddressAndContact AddressAndContact { get; set; } = new();

    public VendorCreditAndFinance CreditAndFinance { get; set; } = new();

    public VendorTaxAndCompliance TaxAndCompliance { get; set; } = new();

    public Guid? LedgerId { get; set; }

    public Ledger? Ledger { get; set; }

    public VendorBankDetails BankDetails { get; set; } = new();

    public VendorOtherInfo Other { get; set; } = new();

    public string Status { get; set; } = VendorStatuses.Active;

    public VendorOpeningBalance? OpeningBalance { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class VendorBasicInfo
{
    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Under { get; set; }
}

public sealed class VendorAddressAndContact
{
    public string? ContactName { get; set; }

    public string? NameInOl { get; set; }

    public string Address { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string? Mobile { get; set; }

    public string Email { get; set; } = string.Empty;

    public string? Web { get; set; }

    public string? Fax { get; set; }
}

public sealed class VendorCreditAndFinance
{
    public decimal? CreditLimit { get; set; }

    public int? DueDays { get; set; }

    public Guid? CurrencyId { get; set; }

    public Currency? Currency { get; set; }

    public string? PaymentTerms { get; set; }

    public string? Remark { get; set; }
}

public sealed class VendorTaxAndCompliance
{
    public string? Gstin { get; set; }

    public string? Tin { get; set; }
}

public sealed class VendorBankDetails
{
    public string? BankDetails { get; set; }

    public string? AccountNo { get; set; }

    public string? BankAddress { get; set; }
}

public sealed class VendorOtherInfo
{
    public string? Company { get; set; }
}

public sealed class VendorOpeningBalance
{
    public Guid VendorId { get; set; }

    public Vendor? Vendor { get; set; }

    public decimal Amount { get; set; }

    public string BalanceType { get; set; } = BalanceTypes.Cr;

    public DateOnly AsOfDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
