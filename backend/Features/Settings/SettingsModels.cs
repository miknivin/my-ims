using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Warehouses;

namespace backend.Features.Settings;

public enum InventoryValuationMethod
{
    MovingAverage = 1,
    FIFO = 2
}

public sealed class AppSettings
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public GeneralSettings General { get; set; } = new();

    public InventorySettings InventorySettings { get; set; } = new();

    public AccountingSettings AccountingSettings { get; set; } = new();

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class GeneralSettings
{
    public string BusinessName { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }
    public string? Country { get; set; }
    public string? Gstin { get; set; }
    public string? Pan { get; set; }
}

public sealed class InventorySettings
{
    public InventoryStockControlSettings StockControl { get; set; } = new();
    public InventoryCostingSettings Costing { get; set; } = new();
    public InventoryBatchSerialSettings BatchSerial { get; set; } = new();
}

public sealed class InventoryStockControlSettings
{
    public bool AllowNegativeStock { get; set; }
    public bool TrackInventoryByWarehouse { get; set; } = true;

    public Guid? DefaultWarehouseId { get; set; }
    public Warehouse? DefaultWarehouse { get; set; }

    public bool BlockSaleWhenStockUnavailable { get; set; } = true;
    public bool AutoUpdateStockOnInvoicePosting { get; set; } = true;
}

public sealed class InventoryCostingSettings
{
    public InventoryValuationMethod ValuationMethod { get; set; } = InventoryValuationMethod.MovingAverage;
    public int CostPrecision { get; set; } = 2;
    public int RoundingPrecision { get; set; } = 2;
    public bool IncludeLandedCostInInventoryCost { get; set; } = true;
}

public sealed class InventoryBatchSerialSettings
{
    public bool EnableBatchTracking { get; set; }
    public bool EnableSerialTracking { get; set; }
    public bool RequireExpiryForBatchItems { get; set; }
}

public sealed class AccountingSettings
{
    public Guid? DiscountAllowedLedgerId { get; set; }
    public Ledger? DiscountAllowedLedger { get; set; }

    public Guid? DiscountReceivedLedgerId { get; set; }
    public Ledger? DiscountReceivedLedger { get; set; }

    public Guid? InventoryLedgerId { get; set; }
    public Ledger? InventoryLedger { get; set; }

    public Guid? SalesLedgerId { get; set; }
    public Ledger? SalesLedger { get; set; }

    public Guid? CostOfGoodsSoldLedgerId { get; set; }
    public Ledger? CostOfGoodsSoldLedger { get; set; }

    public Guid? GrnClearingLedgerId { get; set; }
    public Ledger? GrnClearingLedger { get; set; }

    public Guid? PurchaseTaxLedgerId { get; set; }
    public Ledger? PurchaseTaxLedger { get; set; }

    public Guid? SalesTaxLedgerId { get; set; }
    public Ledger? SalesTaxLedger { get; set; }

    public Guid? DefaultCashLedgerId { get; set; }
    public Ledger? DefaultCashLedger { get; set; }

    public Guid? GrnAdditionLedgerId { get; set; }
    public Ledger? GrnAdditionLedger { get; set; }

    public Guid? GrnDiscountLedgerId { get; set; }
    public Ledger? GrnDiscountLedger { get; set; }

    public Guid? RoundOffLedgerId { get; set; }
    public Ledger? RoundOffLedger { get; set; }
}
