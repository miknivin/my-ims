namespace backend.Features.Settings;

public sealed record AppSettingsDto(
    Guid Id,
    GeneralSettingsDto General,
    InventorySettingsDto InventorySettings,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc)
{
    public static AppSettingsDto FromEntity(AppSettings settings)
    {
        return new AppSettingsDto(
            settings.Id,
            new GeneralSettingsDto(
                settings.General.BusinessName,
                settings.General.ContactPerson,
                settings.General.Phone,
                settings.General.Email,
                settings.General.AddressLine1,
                settings.General.AddressLine2,
                settings.General.City,
                settings.General.State,
                settings.General.Pincode,
                settings.General.Country,
                settings.General.Gstin,
                settings.General.Pan),
            new InventorySettingsDto(
                new InventoryStockControlSettingsDto(
                    settings.InventorySettings.StockControl.AllowNegativeStock,
                    settings.InventorySettings.StockControl.TrackInventoryByWarehouse,
                    settings.InventorySettings.StockControl.DefaultWarehouseId,
                    settings.InventorySettings.StockControl.DefaultWarehouse?.Name,
                    settings.InventorySettings.StockControl.BlockSaleWhenStockUnavailable,
                    settings.InventorySettings.StockControl.AutoUpdateStockOnInvoicePosting),
                new InventoryCostingSettingsDto(
                    ToValuationMethodLabel(settings.InventorySettings.Costing.ValuationMethod),
                    settings.InventorySettings.Costing.CostPrecision,
                    settings.InventorySettings.Costing.RoundingPrecision,
                    settings.InventorySettings.Costing.IncludeLandedCostInInventoryCost),
                new InventoryBatchSerialSettingsDto(
                    settings.InventorySettings.BatchSerial.EnableBatchTracking,
                    settings.InventorySettings.BatchSerial.EnableSerialTracking,
                    settings.InventorySettings.BatchSerial.RequireExpiryForBatchItems)),
            settings.CreatedAtUtc,
            settings.UpdatedAtUtc);
    }

    private static string ToValuationMethodLabel(InventoryValuationMethod value) => value switch
    {
        InventoryValuationMethod.FIFO => "FIFO",
        _ => "Moving Average"
    };
}

public sealed record GeneralSettingsDto(
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

public sealed record InventorySettingsDto(
    InventoryStockControlSettingsDto StockControl,
    InventoryCostingSettingsDto Costing,
    InventoryBatchSerialSettingsDto BatchSerial);

public sealed record InventoryStockControlSettingsDto(
    bool AllowNegativeStock,
    bool TrackInventoryByWarehouse,
    Guid? DefaultWarehouseId,
    string? DefaultWarehouseName,
    bool BlockSaleWhenStockUnavailable,
    bool AutoUpdateStockOnInvoicePosting);

public sealed record InventoryCostingSettingsDto(
    string ValuationMethod,
    int CostPrecision,
    int RoundingPrecision,
    bool IncludeLandedCostInInventoryCost);

public sealed record InventoryBatchSerialSettingsDto(
    bool EnableBatchTracking,
    bool EnableSerialTracking,
    bool RequireExpiryForBatchItems);

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
