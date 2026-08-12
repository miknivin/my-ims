using backend.Features.Masters.Customers;
using backend.Features.Transactions;
using backend.Features.Transactions.SalesOrders;

namespace backend.Features.Inventory.DeliveryNotes;

public static class DeliveryNoteModes
{
    public const string Direct = "Direct";
    public const string AgainstSalesOrder = "AgainstSalesOrder";

    public static readonly string[] All = [Direct, AgainstSalesOrder];
}

public static class DeliveryNoteStatuses
{
    public const string Draft = "Draft";
    public const string Submitted = "Submitted";
    public const string Cancelled = "Cancelled";

    public static readonly string[] All = [Draft, Submitted, Cancelled];
}

public sealed class DeliveryNote
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public DeliveryNoteSourceReference SourceRef { get; set; } = new();
    public DeliveryNoteDocument Document { get; set; } = new();
    public DeliveryNoteCustomerInformation CustomerInformation { get; set; } = new();
    public DeliveryNoteLogistics Logistics { get; set; } = new();
    public DeliveryNoteGeneral General { get; set; } = new();
    public DeliveryNoteFooter Footer { get; set; } = new();

    public List<DeliveryNoteItem> Items { get; set; } = [];

    public string Status { get; set; } = DeliveryNoteStatuses.Draft;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class DeliveryNoteSourceReference
{
    public string Mode { get; set; } = DeliveryNoteModes.Direct;
    public Guid? SalesOrderId { get; set; }
    public string? SalesOrderNo { get; set; }
    public string? DirectRefNo { get; set; }
}

public sealed class DeliveryNoteDocument
{
    public string VoucherType { get; set; } = "DN";
    public string No { get; set; } = string.Empty;
    public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly? ExpectedDeliveryDate { get; set; }
}

public sealed class DeliveryNoteCustomerInformation
{
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string CustomerNameSnapshot { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? ShippingAddress { get; set; }
    public string? Attention { get; set; }
    public string? Phone { get; set; }
}

public sealed class DeliveryNoteLogistics
{
    public string? TransportMode { get; set; }
    public string? LrNo { get; set; }
    public DateOnly? LrDate { get; set; }
    public string? VehicleNo { get; set; }
    public string? EWayBillNo { get; set; }
    public string? TransporterName { get; set; }
}

public sealed class DeliveryNoteGeneral
{
    public string? Notes { get; set; }
}

public sealed class DeliveryNoteFooter
{
    public decimal NetTotal { get; set; }
    public decimal TotalQty { get; set; }
    public decimal TotalAmount { get; set; }
}

public sealed class DeliveryNoteItem : LineItemBase
{
    public Guid DeliveryNoteId { get; set; }
    public DeliveryNote? DeliveryNote { get; set; }

    public int SerialNo { get; set; }
    public decimal Total { get; set; }
    public string? Remark { get; set; }
    public Guid? SalesOrderLineId { get; set; }
}
