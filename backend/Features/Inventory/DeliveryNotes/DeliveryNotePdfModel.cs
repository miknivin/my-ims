namespace backend.Features.Inventory.DeliveryNotes;

public sealed class DeliveryNotePdfModel
{
    public required string No { get; init; }
    public required string Date { get; init; }
    public string? ExpectedDeliveryDate { get; init; }
    public required string Status { get; init; }
    public bool IsPreview { get; init; }

    public required string Mode { get; init; }
    public string? SalesOrderNo { get; init; }
    public string? DirectRefNo { get; init; }

    public required string CustomerName { get; init; }
    public required string CustomerAddress { get; init; }
    public string? ShippingAddress { get; init; }

    public string? TransportMode { get; init; }
    public string? LrNo { get; init; }
    public string? VehicleNo { get; init; }
    public string? EWayBillNo { get; init; }
    public string? TransporterName { get; init; }

    public string? Notes { get; init; }

    public required string TotalQty { get; init; }
    public required string TotalAmount { get; init; }
    public required string NetTotal { get; init; }

    public required IReadOnlyList<DnPdfLineItem> Items { get; init; }

    public string BadgeClass => IsPreview ? "b-preview" : Status switch
    {
        "Submitted" => "b-submitted",
        "Cancelled" => "b-cancelled",
        _ => "b-draft"
    };
    public string BadgeText => IsPreview ? "Preview" : Status;
}

public sealed class DnPdfLineItem
{
    public int Index { get; init; }
    public required string ProductName { get; init; }
    public required string HsnCode { get; init; }
    public required string Quantity { get; init; }
    public required string Uom { get; init; }
    public required string Rate { get; init; }
    public required string Total { get; init; }
    public required string Warehouse { get; init; }
    public string? Remark { get; init; }
}
