using backend.Features.Masters.Customers;
using backend.Features.Masters.Currencies;
using backend.Features.Masters.Ledgers;
using backend.Features.Transactions;

namespace backend.Features.Transactions.SalesInvoices;

public enum SalesInvoiceStatus
{
    Draft = 1,
    Submitted = 2,
    Cancelled = 3
}

public enum SalesInvoiceReferenceType
{
    Direct = 1,
    SalesOrder = 2,
    DeliveryNote = 3
}

public enum SalesInvoicePaymentMode
{
    Cash = 1,
    Credit = 2
}

public enum SalesInvoiceTaxApplication
{
    AfterDiscount = 1,
    BeforeDiscount = 2
}

public enum SalesInvoiceAdditionType
{
    Addition = 1,
    Deduction = 2
}

public sealed class SalesInvoice
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public SalesInvoiceSourceReference SourceRef { get; set; } = new();
    public SalesInvoiceDocument Document { get; set; } = new();
    public SalesInvoiceCustomerInformation CustomerInformation { get; set; } = new();
    public SalesInvoiceFinancialDetails FinancialDetails { get; set; } = new();
    public SalesInvoiceGeneral General { get; set; } = new();

    public List<SalesInvoiceLineItem> Items { get; set; } = [];
    public List<SalesInvoiceAddition> Additions { get; set; } = [];

    public SalesInvoiceFooter Footer { get; set; } = new();

    public SalesInvoiceStatus Status { get; set; } = SalesInvoiceStatus.Draft;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class SalesInvoiceSourceReference
{
    public SalesInvoiceReferenceType Type { get; set; } = SalesInvoiceReferenceType.Direct;
    public Guid? ReferenceId { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
}

public sealed class SalesInvoiceDocument
{
    public string VoucherType { get; set; } = "SI";
    public string No { get; set; } = string.Empty;
    public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly DueDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
}

public sealed class SalesInvoiceCustomerInformation
{
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public string CustomerNameSnapshot { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}

public sealed class SalesInvoiceFinancialDetails
{
    public SalesInvoicePaymentMode PaymentMode { get; set; } = SalesInvoicePaymentMode.Cash;

    public string? InvoiceNo { get; set; }
    public string? LrNo { get; set; }

    public Guid? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public string? CurrencyCodeSnapshot { get; set; }
    public string? CurrencySymbolSnapshot { get; set; }

    public decimal Balance { get; set; }
}

public sealed class SalesInvoiceGeneral
{
    public string? Notes { get; set; }
    public bool Taxable { get; set; } = true;
    public SalesInvoiceTaxApplication TaxApplication { get; set; } = SalesInvoiceTaxApplication.AfterDiscount;
    public bool InterState { get; set; }
}

public sealed class SalesInvoiceAddition
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public SalesInvoiceAdditionType Type { get; set; } = SalesInvoiceAdditionType.Addition;

    public Guid? LedgerId { get; set; }
    public Ledger? Ledger { get; set; }

    public string LedgerNameSnapshot { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
}

public sealed class SalesInvoiceFooter
{
    public string? Notes { get; set; }
    public decimal Total { get; set; }
    public decimal Addition { get; set; }
    public decimal Deduction { get; set; }
    public decimal Paid { get; set; }
    public decimal NetTotal { get; set; }
}

public sealed class SalesInvoiceLineItem : LineItemBase
{
    public Guid SalesInvoiceId { get; set; }
    public SalesInvoice? SalesInvoice { get; set; }

    public int Sno { get; set; }
    public string? ProductCodeSnapshot { get; set; }

    public decimal DiscountPercent { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal TaxAmount { get; set; }

    public decimal CostRate { get; set; }
    public decimal CogsAmount { get; set; }
    public decimal GrossProfitAmount { get; set; }

    public decimal LineTotal { get; set; }
}
