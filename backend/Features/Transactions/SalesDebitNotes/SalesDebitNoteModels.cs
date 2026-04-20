using backend.Features.Masters.Customers;
using backend.Features.Masters.Currencies;
using backend.Features.Masters.Ledgers;
using backend.Features.Transactions;

namespace backend.Features.Transactions.SalesDebitNotes;

public enum SalesDebitNoteStatus
{
    Draft = 1,
    Submitted = 2,
    Cancelled = 3
}

public enum SalesDebitNotePaymentMode
{
    Cash = 1,
    Credit = 2
}

public enum SalesDebitNoteTaxApplication
{
    AfterDiscount = 1,
    BeforeDiscount = 2
}

public enum SalesDebitNoteAdditionType
{
    Addition = 1,
    Deduction = 2
}

public sealed class SalesDebitNote
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public SalesDebitNoteSourceReference SourceRef { get; set; } = new();
    public SalesDebitNoteDocument Document { get; set; } = new();
    public SalesDebitNoteCustomerInformation CustomerInformation { get; set; } = new();
    public SalesDebitNoteFinancialDetails FinancialDetails { get; set; } = new();
    public SalesDebitNoteGeneral General { get; set; } = new();
    public List<SalesDebitNoteLineItem> Items { get; set; } = [];
    public List<SalesDebitNoteAddition> Additions { get; set; } = [];
    public SalesDebitNoteFooter Footer { get; set; } = new();

    public AdjustmentNoteNature NoteNature { get; set; } = AdjustmentNoteNature.Other;
    public bool AffectsInventory => AdjustmentNoteConventions.AffectsInventory(NoteNature);
    public AdjustmentInventoryEffect InventoryEffect => AdjustmentNoteConventions.GetSalesDebitInventoryEffect(NoteNature);

    public SalesDebitNoteStatus Status { get; set; } = SalesDebitNoteStatus.Draft;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class SalesDebitNoteSourceReference
{
    public Guid? ReferenceId { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
}

public sealed class SalesDebitNoteDocument
{
    public string VoucherType { get; set; } = "SDN";
    public string No { get; set; } = string.Empty;
    public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly DueDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
}

public sealed class SalesDebitNoteCustomerInformation
{
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string CustomerNameSnapshot { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}

public sealed class SalesDebitNoteFinancialDetails
{
    public SalesDebitNotePaymentMode PaymentMode { get; set; } = SalesDebitNotePaymentMode.Cash;
    public string? InvoiceNo { get; set; }
    public string? LrNo { get; set; }
    public Guid? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public string? CurrencyCodeSnapshot { get; set; }
    public string? CurrencySymbolSnapshot { get; set; }
    public decimal Balance { get; set; }
}

public sealed class SalesDebitNoteGeneral
{
    public string? Notes { get; set; }
    public bool Taxable { get; set; } = true;
    public SalesDebitNoteTaxApplication TaxApplication { get; set; } = SalesDebitNoteTaxApplication.AfterDiscount;
    public bool InterState { get; set; }
}

public sealed class SalesDebitNoteAddition
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public SalesDebitNoteAdditionType Type { get; set; } = SalesDebitNoteAdditionType.Addition;
    public Guid? LedgerId { get; set; }
    public Ledger? Ledger { get; set; }
    public string LedgerNameSnapshot { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
}

public sealed class SalesDebitNoteFooter
{
    public string? Notes { get; set; }
    public decimal Total { get; set; }
    public decimal Addition { get; set; }
    public decimal Deduction { get; set; }
    public decimal Paid { get; set; }
    public decimal NetTotal { get; set; }
}

public sealed class SalesDebitNoteLineItem : LineItemBase
{
    public Guid SalesDebitNoteId { get; set; }
    public SalesDebitNote? SalesDebitNote { get; set; }
    public Guid SourceLineId { get; set; }
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
