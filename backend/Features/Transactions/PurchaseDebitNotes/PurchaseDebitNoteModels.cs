using backend.Features.Masters.Currencies;
using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Vendors;
using backend.Features.Transactions;

namespace backend.Features.Transactions.PurchaseDebitNotes;

public enum PurchaseDebitNoteStatus
{
    Draft = 1,
    Submitted = 2,
    Cancelled = 3
}

public enum PurchaseDebitNotePaymentMode
{
    Cash = 1,
    Credit = 2
}

public enum PurchaseDebitNoteTaxApplication
{
    AfterDiscount = 1,
    BeforeDiscount = 2
}

public enum PurchaseDebitNoteAdditionType
{
    Addition = 1,
    Deduction = 2
}

public sealed class PurchaseDebitNote
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public PurchaseDebitNoteSourceReference SourceRef { get; set; } = new();
    public PurchaseDebitNoteDocument Document { get; set; } = new();
    public PurchaseDebitNoteVendorInformation VendorInformation { get; set; } = new();
    public PurchaseDebitNoteFinancialDetails FinancialDetails { get; set; } = new();
    public PurchaseDebitNoteProductInformation ProductInformation { get; set; } = new();
    public PurchaseDebitNoteGeneral General { get; set; } = new();

    public List<PurchaseDebitNoteLineItem> Items { get; set; } = [];
    public List<PurchaseDebitNoteAddition> Additions { get; set; } = [];

    public PurchaseDebitNoteFooter Footer { get; set; } = new();

    public AdjustmentNoteNature NoteNature { get; set; } = AdjustmentNoteNature.Other;
    public bool AffectsInventory => AdjustmentNoteConventions.AffectsInventory(NoteNature);
    public AdjustmentInventoryEffect InventoryEffect => AdjustmentNoteConventions.GetPurchaseDebitInventoryEffect(NoteNature);

    public PurchaseDebitNoteStatus Status { get; set; } = PurchaseDebitNoteStatus.Draft;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class PurchaseDebitNoteSourceReference
{
    public Guid? ReferenceId { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
}

public sealed class PurchaseDebitNoteDocument
{
    public string VoucherType { get; set; } = "PDN";
    public string No { get; set; } = string.Empty;
    public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly DueDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
}

public sealed class PurchaseDebitNoteVendorInformation
{
    public Guid VendorId { get; set; }
    public Vendor? Vendor { get; set; }

    public string VendorNameSnapshot { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Attention { get; set; }
    public string? Phone { get; set; }
}

public sealed class PurchaseDebitNoteFinancialDetails
{
    public PurchaseDebitNotePaymentMode PaymentMode { get; set; } = PurchaseDebitNotePaymentMode.Credit;

    public string? SupplierInvoiceNo { get; set; }
    public string? LrNo { get; set; }

    public Guid? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public string? CurrencyCodeSnapshot { get; set; }
    public string? CurrencySymbolSnapshot { get; set; }
}

public sealed class PurchaseDebitNoteProductInformation
{
    public string VendorProducts { get; set; } = "Vendor Products";
    public bool OwnProductsOnly { get; set; }
}

public sealed class PurchaseDebitNoteGeneral
{
    public string? Notes { get; set; }
    public string? SearchBarcode { get; set; }
    public bool Taxable { get; set; } = true;
    public PurchaseDebitNoteTaxApplication TaxApplication { get; set; } = PurchaseDebitNoteTaxApplication.AfterDiscount;
    public bool InterState { get; set; }
    public bool TaxOnFoc { get; set; }
}

public sealed class PurchaseDebitNoteAddition
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public PurchaseDebitNoteAdditionType Type { get; set; } = PurchaseDebitNoteAdditionType.Addition;

    public Guid? LedgerId { get; set; }
    public Ledger? Ledger { get; set; }

    public string LedgerNameSnapshot { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
}

public sealed class PurchaseDebitNoteFooter
{
    public string? Notes { get; set; }
    public decimal Total { get; set; }
    public decimal Discount { get; set; }
    public decimal Addition { get; set; }
    public decimal Deduction { get; set; }
    public decimal NetTotal { get; set; }
}

public sealed class PurchaseDebitNoteLineItem : LineItemBase
{
    public Guid PurchaseDebitNoteId { get; set; }
    public PurchaseDebitNote? PurchaseDebitNote { get; set; }

    public Guid SourceLineId { get; set; }
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
