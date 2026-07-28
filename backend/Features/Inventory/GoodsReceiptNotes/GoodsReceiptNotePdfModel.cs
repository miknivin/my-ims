namespace backend.Features.Inventory.GoodsReceiptNotes;

public sealed class GoodsReceiptNotePdfModel
{
    public required string No { get; init; }
    public required string Date { get; init; }
    public string? DeliveryDate { get; init; }
    public required string Status { get; init; }
    public bool IsPreview { get; init; }

    public required string Mode { get; init; }
    public string? PurchaseOrderNo { get; init; }
    public string? DirectLpoNo { get; init; }
    public string? DirectVendorInvoiceNo { get; init; }

    public required string VendorName { get; init; }
    public required string VendorAddress { get; init; }
    public string? VendorAttention { get; init; }
    public string? VendorPhone { get; init; }

    public string? Notes { get; init; }

    public required string TotalAmount { get; init; }
    public required string Addition { get; init; }
    public required string DiscountFooter { get; init; }
    public required string RoundOff { get; init; }
    public required string NetTotal { get; init; }
    public required string TotalQty { get; init; }
    public required string TotalFoc { get; init; }

    public required IReadOnlyList<GrnPdfLineItem> Items { get; init; }

    public string BadgeClass => IsPreview ? "b-preview" : Status switch
    {
        "Submitted" => "b-submitted",
        "Cancelled" => "b-cancelled",
        _ => "b-draft"
    };
    public string BadgeText => IsPreview ? "Preview" : Status;
    public bool HasAddition => Addition != "0.00";
    public bool HasDiscount => DiscountFooter != "0.00";
    public bool HasRoundOff => RoundOff != "0.00";
    public bool HasFoc => TotalFoc != "0.00";
}

public sealed class GrnPdfLineItem
{
    public int Index { get; init; }
    public required string ProductName { get; init; }
    public required string HsnCode { get; init; }
    public required string Quantity { get; init; }
    public required string FocQuantity { get; init; }
    public required string Uom { get; init; }
    public required string Rate { get; init; }
    public required string DiscountAmount { get; init; }
    public required string Total { get; init; }
}
