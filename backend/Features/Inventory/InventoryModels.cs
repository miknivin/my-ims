using backend.Features.Masters.Products;
using backend.Features.Masters.Warehouses;

namespace backend.Features.Inventory;

public static class StockMovementTypes
{
    public const string Receipt = "Receipt";
    public const string Issue = "Issue";
    public const string Revaluation = "Revaluation";
    public const string AdjustmentIn = "AdjustmentIn";
    public const string AdjustmentOut = "AdjustmentOut";
    public const string TransferIn = "TransferIn";
    public const string TransferOut = "TransferOut";

    public static readonly string[] All =
    [
        Receipt,
        Issue,
        Revaluation,
        AdjustmentIn,
        AdjustmentOut,
        TransferIn,
        TransferOut
    ];
}

public static class StockSourceTypes
{
    public const string GoodsReceiptNote = "GoodsReceiptNote";
    public const string PurchaseCreditNote = "PurchaseCreditNote";
    public const string PurchaseDebitNote = "PurchaseDebitNote";
    public const string PurchaseInvoice = "PurchaseInvoice";
    public const string SalesCreditNote = "SalesCreditNote";
    public const string SalesDebitNote = "SalesDebitNote";
    public const string SalesInvoice = "SalesInvoice";
    public const string StockAdjustment = "StockAdjustment";
    public const string StockTransfer = "StockTransfer";
    public const string OpeningStock = "OpeningStock";

    public static readonly string[] All =
    [
        GoodsReceiptNote,
        PurchaseCreditNote,
        PurchaseDebitNote,
        PurchaseInvoice,
        SalesCreditNote,
        SalesDebitNote,
        SalesInvoice,
        StockAdjustment,
        StockTransfer,
        OpeningStock
    ];
}

public sealed class StockLedgerEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ItemId { get; set; }
    public Product? Item { get; set; }

    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public decimal QuantityChange { get; set; }
    public decimal ValuationRate { get; set; }
    public decimal ValueChange { get; set; }

    public string MovementType { get; set; } = StockMovementTypes.Receipt;
    public string SourceType { get; set; } = StockSourceTypes.GoodsReceiptNote;
    public Guid SourceId { get; set; }
    public Guid? SourceLineId { get; set; }

    public DateTime PostingDateUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public decimal BalanceQuantity { get; set; }
    public decimal BalanceValue { get; set; }

    public string? Remarks { get; set; }
}

public sealed class InventoryBalance
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ItemId { get; set; }
    public Product? Item { get; set; }

    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public decimal QuantityOnHand { get; set; }
    public decimal TotalValue { get; set; }
    public decimal ValuationRate { get; set; }

    public DateTime LastUpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class FifoLayer
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ItemId { get; set; }
    public Product? Item { get; set; }

    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public string SourceType { get; set; } = StockSourceTypes.GoodsReceiptNote;
    public Guid SourceId { get; set; }
    public Guid? SourceLineId { get; set; }

    public decimal OriginalQuantity { get; set; }
    public decimal RemainingQuantity { get; set; }
    public decimal Rate { get; set; }

    public DateTime PostingDateUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public bool IsDepleted => RemainingQuantity <= 0;
}

public sealed class InventoryLayerConsumption
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid IssueStockLedgerEntryId { get; set; }
    public StockLedgerEntry? IssueStockLedgerEntry { get; set; }

    public Guid FifoLayerId { get; set; }
    public FifoLayer? FifoLayer { get; set; }

    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal Value { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class InventoryLayerRevaluation
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid StockLedgerEntryId { get; set; }
    public StockLedgerEntry? StockLedgerEntry { get; set; }

    public Guid FifoLayerId { get; set; }
    public FifoLayer? FifoLayer { get; set; }

    public decimal QuantityAtRevaluation { get; set; }
    public decimal PreviousRate { get; set; }
    public decimal NewRate { get; set; }
    public decimal ValueDelta { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
