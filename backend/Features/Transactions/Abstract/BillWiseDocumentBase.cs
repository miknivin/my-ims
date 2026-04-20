namespace backend.Features.Transactions;

public enum BillWiseVoucherType
{
    Payment = 1,
    Receipt = 2
}

public enum BillWiseSourceVoucherType
{
    PurchaseInvoice = 1,
    SalesInvoice = 2
}

public enum BillWiseDocumentStatus
{
    Draft = 1,
    Submitted = 2,
    Cancelled = 3
}

public abstract class BillWiseDocumentBase<TAllocation>
    where TAllocation : BillWiseAllocationBase
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public BillWiseVoucherType VoucherType { get; set; }

    public string No { get; set; } = string.Empty;

    public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    public string? ReferenceNo { get; set; }

    public string? InstrumentNo { get; set; }

    public DateOnly? InstrumentDate { get; set; }

    public string? Notes { get; set; }

    public decimal TotalAllocated { get; set; }

    public decimal TotalDiscount { get; set; }

    public decimal Advance { get; set; }

    public decimal Amount { get; set; }

    public BillWiseDocumentStatus Status { get; set; } = BillWiseDocumentStatus.Draft;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public List<TAllocation> Allocations { get; set; } = [];

    public void RecalculateTotals()
    {
        foreach (var allocation in Allocations)
        {
            allocation.Recalculate();
        }

        TotalAllocated = RoundAmount(Allocations.Sum(allocation => allocation.PaidAmount));
        TotalDiscount = RoundAmount(Allocations.Sum(allocation => allocation.DiscountAmount));
        Advance = RoundAmount(Advance);
        Amount = RoundAmount(TotalAllocated + Advance);
    }

    protected static decimal RoundAmount(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
