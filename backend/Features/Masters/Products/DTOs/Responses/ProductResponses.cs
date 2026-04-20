namespace backend.Features.Masters.Products;

public sealed record ProductOpeningStockDto(decimal Quantity, DateOnly AsOfDate);
public sealed record ProductBasicInfoDto(string Code, string Name, string? OtherLanguage, Guid? TaxId, string? TaxName);
public sealed record ProductPricingAndRatesDto(decimal? ProfitPercentage, decimal? PurchaseRate, decimal? Cost, decimal? SalesRate, decimal? NormalRate, decimal? Mrp, decimal? WholesaleRate);
public sealed record ProductStockAndMeasurementDto(string? Hsn, Guid BaseUomId, string BaseUomName, Guid PurchaseUomId, string PurchaseUomName, Guid SalesUomId, string SalesUomName, Guid StockUomId, string StockUomName, decimal? MinimumStock, decimal? MaximumStock, decimal? ReOrderLevel, decimal? ReOrderQuantity);
public sealed record ProductGeneralSettingsDto(bool Inactive, bool LessProfit, bool CounterItem, bool AutoEntry, bool HideFromDevice, int ExpiryDays, bool TaxInclusive, bool SerialNo);
public sealed record ProductCategorizationDto(Guid? GroupCategoryId, string? GroupCategoryName, Guid? SubGroupCategoryId, string? SubGroupCategoryName, Guid? VendorId, string? VendorName, string? Brand);
public sealed record ProductPropertiesDto(ProductGeneralSettingsDto GeneralSettings, ProductCategorizationDto Categorization);
public sealed record ProductAdditionalDetailsDto(decimal? PackUnit, decimal? AdditionPercentage, decimal? Addition, string? Company, string? WarehouseStock, string? Document, string? Barcode, string? PurchaseHistory, string? SalesHistory, string? CompanyStock);
public sealed record ProductDto(Guid Id, ProductBasicInfoDto BasicInfo, ProductPricingAndRatesDto PricingAndRates, ProductStockAndMeasurementDto StockAndMeasurement, ProductPropertiesDto Properties, ProductAdditionalDetailsDto AdditionalDetails, string Status, ProductOpeningStockDto? OpeningStock, DateTime CreatedAtUtc, DateTime UpdatedAtUtc)
{
    public static ProductDto FromEntity(Product product)
    {
        return new ProductDto(
            product.Id,
            new ProductBasicInfoDto(product.BasicInfo.Code, product.BasicInfo.Name, product.BasicInfo.OtherLanguage, product.BasicInfo.TaxId, product.BasicInfo.Tax?.Name),
            new ProductPricingAndRatesDto(product.PricingAndRates.ProfitPercentage, product.PricingAndRates.PurchaseRate, product.PricingAndRates.Cost, product.PricingAndRates.SalesRate, product.PricingAndRates.NormalRate, product.PricingAndRates.Mrp, product.PricingAndRates.WholesaleRate),
            new ProductStockAndMeasurementDto(product.StockAndMeasurement.Hsn, product.StockAndMeasurement.BaseUomId, product.StockAndMeasurement.BaseUom?.Name ?? string.Empty, product.StockAndMeasurement.PurchaseUomId, product.StockAndMeasurement.PurchaseUom?.Name ?? string.Empty, product.StockAndMeasurement.SalesUomId, product.StockAndMeasurement.SalesUom?.Name ?? string.Empty, product.StockAndMeasurement.StockUomId, product.StockAndMeasurement.StockUom?.Name ?? string.Empty, product.StockAndMeasurement.MinimumStock, product.StockAndMeasurement.MaximumStock, product.StockAndMeasurement.ReOrderLevel, product.StockAndMeasurement.ReOrderQuantity),
            new ProductPropertiesDto(
                new ProductGeneralSettingsDto(product.Properties.GeneralSettings.Inactive, product.Properties.GeneralSettings.LessProfit, product.Properties.GeneralSettings.CounterItem, product.Properties.GeneralSettings.AutoEntry, product.Properties.GeneralSettings.HideFromDevice, product.Properties.GeneralSettings.ExpiryDays, product.Properties.GeneralSettings.TaxInclusive, product.Properties.GeneralSettings.SerialNo),
                new ProductCategorizationDto(product.Properties.Categorization.GroupCategoryId, product.Properties.Categorization.GroupCategory?.Name, product.Properties.Categorization.SubGroupCategoryId, product.Properties.Categorization.SubGroupCategory?.Name, product.Properties.Categorization.VendorId, product.Properties.Categorization.Vendor?.BasicInfo.Name, product.Properties.Categorization.Brand)),
            new ProductAdditionalDetailsDto(product.AdditionalDetails.PackUnit, product.AdditionalDetails.AdditionPercentage, product.AdditionalDetails.Addition, product.AdditionalDetails.Company, product.AdditionalDetails.WarehouseStock, product.AdditionalDetails.Document, product.AdditionalDetails.Barcode, product.AdditionalDetails.PurchaseHistory, product.AdditionalDetails.SalesHistory, product.AdditionalDetails.CompanyStock),
            product.Status,
            product.OpeningStock is null ? null : new ProductOpeningStockDto(product.OpeningStock.Quantity, product.OpeningStock.AsOfDate),
            product.CreatedAtUtc,
            product.UpdatedAtUtc);
    }
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
