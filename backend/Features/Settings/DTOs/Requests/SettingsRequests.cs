namespace backend.Features.Settings;

public sealed record UpdateAppSettingsRequest(
    GeneralSettingsRequest General,
    InventorySettingsRequest InventorySettings);

public sealed record GeneralSettingsRequest(
    string BusinessName,
    string? ContactPerson,
    string? Phone,
    string? Email,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? Pincode,
    string? Country,
    string? Gstin,
    string? Pan);

public sealed record InventorySettingsRequest(
    InventoryStockControlSettingsRequest StockControl,
    InventoryCostingSettingsRequest Costing,
    InventoryBatchSerialSettingsRequest BatchSerial);

public sealed record InventoryStockControlSettingsRequest(
    bool AllowNegativeStock,
    bool TrackInventoryByWarehouse,
    Guid? DefaultWarehouseId,
    bool BlockSaleWhenStockUnavailable,
    bool AutoUpdateStockOnInvoicePosting);

public sealed record InventoryCostingSettingsRequest(
    string ValuationMethod,
    int CostPrecision,
    int RoundingPrecision,
    bool IncludeLandedCostInInventoryCost);

public sealed record InventoryBatchSerialSettingsRequest(
    bool EnableBatchTracking,
    bool EnableSerialTracking,
    bool RequireExpiryForBatchItems);
