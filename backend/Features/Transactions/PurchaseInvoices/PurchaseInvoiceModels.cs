using backend.Features.Masters.Currencies;
using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Vendors;
using backend.Features.Transactions;

namespace backend.Features.Transactions.PurchaseInvoices;

public enum PurchaseInvoiceStatus
{
    Draft = 1,
    Submitted = 2,
    Cancelled = 3
}

public enum PurchaseInvoiceReferenceType
{
    Direct = 1,
    PurchaseOrder = 2,
    GoodsReceipt = 3
}

public enum PurchaseInvoicePaymentMode
{
    Cash = 1,
    Credit = 2
}

public enum PurchaseInvoiceTaxApplication
{
    AfterDiscount = 1,
    BeforeDiscount = 2
}

public enum PurchaseInvoiceAdditionType
{
    Addition = 1,
    Deduction = 2
}

public sealed class PurchaseInvoice
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public PurchaseInvoiceSourceReference SourceRef { get; set; } = new();
    public PurchaseInvoiceDocument Document { get; set; } = new();

    public PurchaseInvoiceVendorInformation VendorInformation { get; set; } = new();
    public PurchaseInvoiceFinancialDetails FinancialDetails { get; set; } = new();
    public PurchaseInvoiceProductInformation ProductInformation { get; set; } = new();
    public PurchaseInvoiceGeneral General { get; set; } = new();

    public List<PurchaseInvoiceLineItem> Items { get; set; } = [];
    public List<PurchaseInvoiceAddition> Additions { get; set; } = [];

    public PurchaseInvoiceFooter Footer { get; set; } = new();

    public PurchaseInvoiceStatus Status { get; set; } = PurchaseInvoiceStatus.Draft;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class PurchaseInvoiceSourceReference
{
    public PurchaseInvoiceReferenceType Type { get; set; } = PurchaseInvoiceReferenceType.Direct;
    public Guid? ReferenceId { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
}

public sealed class PurchaseInvoiceDocument
{
    public string No { get; set; } = string.Empty;
    public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly DueDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
}

public sealed class PurchaseInvoiceVendorInformation
{
    public Guid VendorId { get; set; }
    public Vendor? Vendor { get; set; }

    public string VendorNameSnapshot { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Attention { get; set; }
    public string? Phone { get; set; }
}

public sealed class PurchaseInvoiceFinancialDetails
{
    public PurchaseInvoicePaymentMode PaymentMode { get; set; } = PurchaseInvoicePaymentMode.Credit;

    public string? SupplierInvoiceNo { get; set; }
    public string? LrNo { get; set; }

    public Guid? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public string? CurrencyCodeSnapshot { get; set; }
    public string? CurrencySymbolSnapshot { get; set; }

    public decimal Balance { get; set; }
}

public sealed class PurchaseInvoiceProductInformation
{
    public string VendorProducts { get; set; } = "Vendor Products";
    public bool OwnProductsOnly { get; set; }
}

public sealed class PurchaseInvoiceGeneral
{
    public string? Notes { get; set; }
    public string? SearchBarcode { get; set; }
    public bool Taxable { get; set; } = true;
    public PurchaseInvoiceTaxApplication TaxApplication { get; set; } = PurchaseInvoiceTaxApplication.AfterDiscount;
    public bool InterState { get; set; }
    public bool TaxOnFoc { get; set; }
}

public sealed class PurchaseInvoiceAddition
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public PurchaseInvoiceAdditionType Type { get; set; } = PurchaseInvoiceAdditionType.Addition;

    public Guid? LedgerId { get; set; }
    public Ledger? Ledger { get; set; }

    public string LedgerNameSnapshot { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
}

public sealed class PurchaseInvoiceFooter
{
    public string? Notes { get; set; }
    public decimal Total { get; set; }
    public decimal Discount { get; set; }
    public decimal Addition { get; set; }
    public decimal Deduction { get; set; }
    public decimal NetTotal { get; set; }
}

public sealed class PurchaseInvoiceLineItem : LineItemBase
{
    public Guid PurchaseInvoiceId { get; set; }
    public PurchaseInvoice? PurchaseInvoice { get; set; }

    public int Sno { get; set; }
    public string? ProductCodeSnapshot { get; set; }

    public decimal Foc { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal TaxAmount { get; set; }

    public decimal Cost { get; set; }
    public decimal ProfitPercent { get; set; }
    public decimal ProfitAmount { get; set; }

    public decimal SellingRate { get; set; }
    public decimal WholesaleRate { get; set; }
    public decimal Mrp { get; set; }

    public decimal LineTotal { get; set; }
}
