namespace backend.Features.Transactions.PurchaseOrders;

public sealed class PurchaseOrderPdfModel
{
    public required string No { get; init; }
    public required string Date { get; init; }
    public required string DueDate { get; init; }
    public required string DeliveryDate { get; init; }
    public string? Reference { get; init; }
    public string? MrNo { get; init; }
    public required string Status { get; init; }
    public bool IsPreview { get; init; }

    public required string VendorName { get; init; }
    public required string VendorAddress { get; init; }
    public string? VendorAttention { get; init; }
    public string? VendorPhone { get; init; }

    public required string PaymentMode { get; init; }
    public string? Currency { get; init; }

    public string? WarehouseName { get; init; }
    public required string DeliveryAddress { get; init; }
    public string? DeliveryAttention { get; init; }
    public string? DeliveryPhone { get; init; }

    public string? Notes { get; init; }
    public string? Remarks { get; init; }

    public required string Total { get; init; }
    public required string Discount { get; init; }
    public required string Tax { get; init; }
    public decimal AdditionRaw { get; init; }
    public required string Advance { get; init; }
    public required string NetTotal { get; init; }

    public required IReadOnlyList<PdfLineItem> Items { get; init; }
    public required IReadOnlyList<PdfAddition> Additions { get; init; }

    public string BadgeClass => IsPreview ? "b-preview" : Status switch
    {
        "Submitted" => "b-submitted",
        "Cancelled" => "b-cancelled",
        _ => "b-draft"
    };
    public string BadgeText => IsPreview ? "Preview" : Status;
    public bool HasAddition => AdditionRaw != 0;
    public string AdditionSign => AdditionRaw >= 0 ? "+" : "−";
    public string AdditionAbs => Math.Abs(AdditionRaw).ToString("N2", System.Globalization.CultureInfo.InvariantCulture);
    public bool HasAdvance => Advance != "0.00";
}

public sealed class PdfLineItem
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

public sealed class PdfAddition
{
    public required string Name { get; init; }
    public required string Amount { get; init; }
    public bool IsDeduction { get; init; }
}
