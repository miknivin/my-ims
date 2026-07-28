namespace backend.Features.Transactions.SalesInvoices;

public sealed class SalesInvoicePdfModel
{
    public required string No { get; init; }
    public required string Date { get; init; }
    public required string DueDate { get; init; }
    public required string Status { get; init; }
    public bool IsPreview { get; init; }

    public required string ReferenceType { get; init; }
    public string? ReferenceNo { get; init; }

    public required string CustomerName { get; init; }
    public required string CustomerAddress { get; init; }

    public string? CustomerGstin { get; init; }
    public string? ShippingAddress { get; init; }
    public string? SalespersonName { get; init; }

    public required string PaymentMode { get; init; }
    public string? CustomerInvoiceNo { get; init; }
    public string? LrNo { get; init; }
    public string? Currency { get; init; }

    public bool Taxable { get; init; }
    public bool InterState { get; init; }
    public string? Notes { get; init; }
    public string? FooterNotes { get; init; }

    public required string Total { get; init; }
    public required string Tax { get; init; }
    public required string NetTotal { get; init; }
    public decimal AdditionRaw { get; init; }
    public decimal DeductionRaw { get; init; }

    public required IReadOnlyList<SiPdfLineItem> Items { get; init; }
    public required IReadOnlyList<SiPdfAddition> Additions { get; init; }

    public string BadgeClass => IsPreview ? "b-preview" : Status switch
    {
        "Submitted" => "b-submitted",
        "Cancelled" => "b-cancelled",
        _ => "b-draft"
    };
    public string BadgeText => IsPreview ? "Preview" : Status;
    public bool HasAddition => AdditionRaw != 0 || DeductionRaw != 0;
    public string AdditionSign => (AdditionRaw - DeductionRaw) >= 0 ? "+" : "−";
    public string AdditionAbs => Math.Abs(AdditionRaw - DeductionRaw).ToString("N2", System.Globalization.CultureInfo.InvariantCulture);
}

public sealed class SiPdfLineItem
{
    public int Index { get; init; }
    public required string ProductName { get; init; }
    public required string HsnCode { get; init; }
    public required string Quantity { get; init; }
    public required string Uom { get; init; }
    public required string Rate { get; init; }
    public required string DiscountAmount { get; init; }
    public required string TaxAmount { get; init; }
    public required string Total { get; init; }
}

public sealed class SiPdfAddition
{
    public required string Name { get; init; }
    public required string Amount { get; init; }
    public bool IsDeduction { get; init; }
}
