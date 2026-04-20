using backend.Features.Masters.Vendors;
using backend.Features.Transactions;

namespace backend.Features.Inventory.GoodsReceiptNotes;

public static class GoodsReceiptModes
{
    public const string AgainstPurchaseOrder = "AgainstPurchaseOrder";
    public const string Direct = "Direct";

    public static readonly string[] All =
    [
        AgainstPurchaseOrder,
        Direct
    ];
}

public static class GoodsReceiptStatuses
{
    public const string Draft = "Draft";
    public const string Submitted = "Submitted";
    public const string Cancelled = "Cancelled";

    public static readonly string[] All =
    [
        Draft,
        Submitted,
        Cancelled
    ];
}

public static class TaxableModes
{
    public const string Taxable = "Taxable";
    public const string NonTaxable = "NonTaxable";

    public static readonly string[] All =
    [
        Taxable,
        NonTaxable
    ];
}

public sealed class GoodsReceiptNote
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public GoodsReceiptNoteSourceReference SourceRef { get; set; } = new();
    public GoodsReceiptNoteDocument Document { get; set; } = new();
    public GoodsReceiptNoteVendorInformation VendorInformation { get; set; } = new();
    public GoodsReceiptNoteLogistics Logistics { get; set; } = new();
    public GoodsReceiptNoteGeneral General { get; set; } = new();
    public GoodsReceiptNoteFooter Footer { get; set; } = new();

    public List<GoodsReceiptNoteItem> Items { get; set; } = [];

    public string Status { get; set; } = GoodsReceiptStatuses.Draft;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class GoodsReceiptNoteSourceReference
{
    public string Mode { get; set; } = GoodsReceiptModes.Direct;
    public Guid? PurchaseOrderId { get; set; }
    public string? PurchaseOrderNo { get; set; }
    public string? DirectLpoNo { get; set; }
    public string? DirectVendorInvoiceNo { get; set; }
}

public sealed class GoodsReceiptNoteDocument
{
    public string VoucherType { get; set; } = "GRN";
    public string No { get; set; } = string.Empty;
    public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly? DeliveryDate { get; set; }
}

public sealed class GoodsReceiptNoteVendorInformation
{
    public Guid VendorId { get; set; }
    public Vendor? Vendor { get; set; }
    public string VendorNameSnapshot { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Attention { get; set; }
    public string? Phone { get; set; }
}

public sealed class GoodsReceiptNoteLogistics
{
    public string? LrService { get; set; }
    public string? LrNo { get; set; }
    public DateOnly? LrDate { get; set; }
}

public sealed class GoodsReceiptNoteGeneral
{
    public bool OwnProductsOnly { get; set; }
    public string TaxableMode { get; set; } = TaxableModes.Taxable;
    public string? Notes { get; set; }
}

public sealed class GoodsReceiptNoteFooter
{
    public decimal Addition { get; set; }
    public decimal DiscountFooter { get; set; }
    public decimal RoundOff { get; set; }
    public decimal NetTotal { get; set; }
    public decimal TotalQty { get; set; }
    public decimal TotalFoc { get; set; }
    public decimal TotalAmount { get; set; }
}

public sealed class GoodsReceiptNoteItem : LineItemBase
{
    public Guid GoodsReceiptNoteId { get; set; }
    public GoodsReceiptNote? GoodsReceiptNote { get; set; }

    public int SerialNo { get; set; }
    public string? Code { get; set; }
    public string? Ubc { get; set; }
    public decimal FRate { get; set; }
    public decimal FocQuantity { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal Total { get; set; }
    public DateOnly? ManufacturingDateUtc { get; set; }
    public DateOnly? ExpiryDateUtc { get; set; }
    public string? Remark { get; set; }
    public decimal SellingRate { get; set; }
    public Guid? PurchaseOrderLineId { get; set; }
}
