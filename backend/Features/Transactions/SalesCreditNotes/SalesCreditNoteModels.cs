using backend.Features.Masters.Customers;
using backend.Features.Masters.Currencies;
using backend.Features.Masters.Ledgers;
using backend.Features.Transactions;

namespace backend.Features.Transactions.SalesCreditNotes;

public enum SalesCreditNoteStatus
{
    Draft = 1,
    Submitted = 2,
    Cancelled = 3
}

public enum SalesCreditNotePaymentMode
{
    Cash = 1,
    Credit = 2
}

public enum SalesCreditNoteTaxApplication
{
    AfterDiscount = 1,
    BeforeDiscount = 2
}

public enum SalesCreditNoteAdditionType
{
    Addition = 1,
    Deduction = 2
}

public sealed class SalesCreditNote
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public SalesCreditNoteSourceReference SourceRef { get; set; } = new();
    public SalesCreditNoteDocument Document { get; set; } = new();
    public SalesCreditNoteCustomerInformation CustomerInformation { get; set; } = new();
    public SalesCreditNoteFinancialDetails FinancialDetails { get; set; } = new();
    public SalesCreditNoteGeneral General { get; set; } = new();
    public List<SalesCreditNoteLineItem> Items { get; set; } = [];
    public List<SalesCreditNoteAddition> Additions { get; set; } = [];
    public SalesCreditNoteFooter Footer { get; set; } = new();

    public AdjustmentNoteNature NoteNature { get; set; } = AdjustmentNoteNature.Other;
    public bool AffectsInventory => AdjustmentNoteConventions.AffectsInventory(NoteNature);
    public AdjustmentInventoryEffect InventoryEffect => AdjustmentNoteConventions.GetSalesCreditInventoryEffect(NoteNature);

    public SalesCreditNoteStatus Status { get; set; } = SalesCreditNoteStatus.Draft;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class SalesCreditNoteSourceReference
{
    public Guid? ReferenceId { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
}

public sealed class SalesCreditNoteDocument
{
    public string VoucherType { get; set; } = "SCN";
    public string No { get; set; } = string.Empty;
    public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly DueDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
}

public sealed class SalesCreditNoteCustomerInformation
{
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string CustomerNameSnapshot { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}

public sealed class SalesCreditNoteFinancialDetails
{
    public SalesCreditNotePaymentMode PaymentMode { get; set; } = SalesCreditNotePaymentMode.Cash;
    public string? InvoiceNo { get; set; }
    public string? LrNo { get; set; }
    public Guid? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public string? CurrencyCodeSnapshot { get; set; }
    public string? CurrencySymbolSnapshot { get; set; }
    public decimal Balance { get; set; }
}

public sealed class SalesCreditNoteGeneral
{
    public string? Notes { get; set; }
    public bool Taxable { get; set; } = true;
    public SalesCreditNoteTaxApplication TaxApplication { get; set; } = SalesCreditNoteTaxApplication.AfterDiscount;
    public bool InterState { get; set; }
}

public sealed class SalesCreditNoteAddition
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public SalesCreditNoteAdditionType Type { get; set; } = SalesCreditNoteAdditionType.Addition;
    public Guid? LedgerId { get; set; }
    public Ledger? Ledger { get; set; }
    public string LedgerNameSnapshot { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
}

public sealed class SalesCreditNoteFooter
{
    public string? Notes { get; set; }
    public decimal Total { get; set; }
    public decimal Addition { get; set; }
    public decimal Deduction { get; set; }
    public decimal Paid { get; set; }
    public decimal NetTotal { get; set; }
}

public sealed class SalesCreditNoteLineItem : LineItemBase
{
    public Guid SalesCreditNoteId { get; set; }
    public SalesCreditNote? SalesCreditNote { get; set; }
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
