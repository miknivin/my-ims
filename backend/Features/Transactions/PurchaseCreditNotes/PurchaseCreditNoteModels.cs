using backend.Features.Masters.Currencies;
using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Vendors;
using backend.Features.Transactions;

namespace backend.Features.Transactions.PurchaseCreditNotes;

public enum PurchaseCreditNoteStatus
{
    Draft = 1,
    Submitted = 2,
    Cancelled = 3
}

public enum PurchaseCreditNotePaymentMode
{
    Cash = 1,
    Credit = 2
}

public enum PurchaseCreditNoteTaxApplication
{
    AfterDiscount = 1,
    BeforeDiscount = 2
}

public enum PurchaseCreditNoteAdditionType
{
    Addition = 1,
    Deduction = 2
}

public sealed class PurchaseCreditNote
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public PurchaseCreditNoteSourceReference SourceRef { get; set; } = new();
    public PurchaseCreditNoteDocument Document { get; set; } = new();
    public PurchaseCreditNoteVendorInformation VendorInformation { get; set; } = new();
    public PurchaseCreditNoteFinancialDetails FinancialDetails { get; set; } = new();
    public PurchaseCreditNoteProductInformation ProductInformation { get; set; } = new();
    public PurchaseCreditNoteGeneral General { get; set; } = new();

    public List<PurchaseCreditNoteLineItem> Items { get; set; } = [];
    public List<PurchaseCreditNoteAddition> Additions { get; set; } = [];

    public PurchaseCreditNoteFooter Footer { get; set; } = new();

    public AdjustmentNoteNature NoteNature { get; set; } = AdjustmentNoteNature.Other;
    public bool AffectsInventory => AdjustmentNoteConventions.AffectsInventory(NoteNature);
    public AdjustmentInventoryEffect InventoryEffect => AdjustmentNoteConventions.GetPurchaseCreditInventoryEffect(NoteNature);

    public PurchaseCreditNoteStatus Status { get; set; } = PurchaseCreditNoteStatus.Draft;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class PurchaseCreditNoteSourceReference
{
    public Guid? ReferenceId { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
}

public sealed class PurchaseCreditNoteDocument
{
    public string VoucherType { get; set; } = "PCN";
    public string No { get; set; } = string.Empty;
    public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly DueDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
}

public sealed class PurchaseCreditNoteVendorInformation
{
    public Guid VendorId { get; set; }
    public Vendor? Vendor { get; set; }

    public string VendorNameSnapshot { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Attention { get; set; }
    public string? Phone { get; set; }
}

public sealed class PurchaseCreditNoteFinancialDetails
{
    public PurchaseCreditNotePaymentMode PaymentMode { get; set; } = PurchaseCreditNotePaymentMode.Credit;

    public string? SupplierInvoiceNo { get; set; }
    public string? LrNo { get; set; }

    public Guid? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public string? CurrencyCodeSnapshot { get; set; }
    public string? CurrencySymbolSnapshot { get; set; }
}

public sealed class PurchaseCreditNoteProductInformation
{
    public string VendorProducts { get; set; } = "Vendor Products";
    public bool OwnProductsOnly { get; set; }
}

public sealed class PurchaseCreditNoteGeneral
{
    public string? Notes { get; set; }
    public string? SearchBarcode { get; set; }
    public bool Taxable { get; set; } = true;
    public PurchaseCreditNoteTaxApplication TaxApplication { get; set; } = PurchaseCreditNoteTaxApplication.AfterDiscount;
    public bool InterState { get; set; }
    public bool TaxOnFoc { get; set; }
}

public sealed class PurchaseCreditNoteAddition
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public PurchaseCreditNoteAdditionType Type { get; set; } = PurchaseCreditNoteAdditionType.Addition;

    public Guid? LedgerId { get; set; }
    public Ledger? Ledger { get; set; }

    public string LedgerNameSnapshot { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
}

public sealed class PurchaseCreditNoteFooter
{
    public string? Notes { get; set; }
    public decimal Total { get; set; }
    public decimal Discount { get; set; }
    public decimal Addition { get; set; }
    public decimal Deduction { get; set; }
    public decimal NetTotal { get; set; }
}

public sealed class PurchaseCreditNoteLineItem : LineItemBase
{
    public Guid PurchaseCreditNoteId { get; set; }
    public PurchaseCreditNote? PurchaseCreditNote { get; set; }

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
