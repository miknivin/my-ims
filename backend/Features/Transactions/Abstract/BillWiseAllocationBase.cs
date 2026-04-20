namespace backend.Features.Transactions;

public abstract class BillWiseAllocationBase
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public int Sno { get; set; }

    public BillWiseSourceVoucherType SourceVoucherType { get; set; }

    public string SourceNo { get; set; } = string.Empty;

    public DateOnly SourceDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    public DateOnly? SourceDueDate { get; set; }

    public string? SourceReferenceNo { get; set; }

    public string? DescriptionSnapshot { get; set; }

    public decimal OriginalAmount { get; set; }

    public decimal OutstandingBefore { get; set; }

    public decimal PaidAmount { get; set; }

    public decimal DiscountAmount { get; set; }

    public decimal OutstandingAfter { get; set; }

    public void Recalculate()
    {
        OutstandingAfter = RoundAmount(OutstandingBefore - PaidAmount - DiscountAmount);
    }

    protected static decimal RoundAmount(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
