using backend.Features.Masters.Ledgers;

namespace backend.Features.Accounting.Journals;

public enum JournalVoucherType : short
{
    ManualJournal = 1,
    OpeningBalance = 2,
    SalesInvoice = 10,
    PurchaseInvoice = 11,
    SalesCreditNote = 12,
    SalesDebitNote = 13,
    PurchaseCreditNote = 14,
    PurchaseDebitNote = 15,
    BillWiseReceipt = 16,
    BillWisePayment = 17
}

public enum JournalVoucherStatus : short
{
    Draft = 1,
    Posted = 2,
    Reversed = 3
}

public enum JournalSourceType : short
{
    ManualJournal = 1,
    OpeningBalance = 2,
    SalesInvoice = 10,
    PurchaseInvoice = 11,
    SalesCreditNote = 12,
    SalesDebitNote = 13,
    PurchaseCreditNote = 14,
    PurchaseDebitNote = 15,
    BillWiseReceipt = 16,
    BillWisePayment = 17
}

public enum SubLedgerType : short
{
    Customer = 1,
    Vendor = 2
}

public sealed class JournalVoucher
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public JournalVoucherType VoucherType { get; set; } = JournalVoucherType.ManualJournal;

    public string VoucherNo { get; set; } = string.Empty;

    public DateOnly PostingDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    public JournalVoucherStatus Status { get; set; } = JournalVoucherStatus.Draft;

    public JournalSourceType? SourceType { get; set; }

    public Guid? SourceId { get; set; }

    public string? Narration { get; set; }

    public Guid? ReversesJournalVoucherId { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public List<JournalEntry> Entries { get; set; } = [];
}

public sealed class JournalEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid JournalVoucherId { get; set; }

    public JournalVoucher? JournalVoucher { get; set; }

    public int LineNo { get; set; }

    public DateOnly PostingDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    public JournalVoucherType VoucherType { get; set; } = JournalVoucherType.ManualJournal;

    public string VoucherNo { get; set; } = string.Empty;

    public JournalSourceType? SourceType { get; set; }

    public Guid? SourceId { get; set; }

    public Guid LedgerId { get; set; }

    public Ledger? Ledger { get; set; }

    public SubLedgerType? SubLedgerType { get; set; }

    public Guid? SubLedgerId { get; set; }

    public string? SubLedgerCodeSnapshot { get; set; }

    public string? SubLedgerNameSnapshot { get; set; }

    public string? Narration { get; set; }

    public decimal DebitAmount { get; set; }

    public decimal CreditAmount { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
