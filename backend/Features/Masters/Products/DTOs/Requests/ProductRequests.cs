namespace backend.Features.Masters.Products;

public sealed record ProductBasicInfoRequest(string Code, string Name, string? OtherLanguage, Guid? TaxId);
public sealed record ProductPricingAndRatesRequest(decimal? ProfitPercentage, decimal? PurchaseRate, decimal? Cost, decimal? SalesRate, decimal? NormalRate, decimal? Mrp, decimal? WholesaleRate);
public sealed record ProductStockAndMeasurementRequest(string? Hsn, Guid BaseUomId, Guid PurchaseUomId, Guid SalesUomId, Guid StockUomId, decimal? MinimumStock, decimal? MaximumStock, decimal? ReOrderLevel, decimal? ReOrderQuantity);
public sealed record ProductGeneralSettingsRequest(bool Inactive, bool LessProfit, bool CounterItem, bool AutoEntry, bool HideFromDevice, int ExpiryDays, bool TaxInclusive, bool SerialNo);
public sealed record ProductCategorizationRequest(Guid? GroupCategoryId, Guid? SubGroupCategoryId, Guid? VendorId, string? Brand);
public sealed record ProductPropertiesRequest(ProductGeneralSettingsRequest GeneralSettings, ProductCategorizationRequest Categorization);
public sealed record ProductAdditionalDetailsRequest(decimal? PackUnit, decimal? AdditionPercentage, decimal? Addition, string? Company, string? WarehouseStock, string? Document, string? Barcode, string? PurchaseHistory, string? SalesHistory, string? CompanyStock);
public sealed record ProductOpeningStockRequest(decimal Quantity, DateOnly AsOfDate);
public sealed record CreateProductRequest(ProductBasicInfoRequest BasicInfo, ProductPricingAndRatesRequest PricingAndRates, ProductStockAndMeasurementRequest StockAndMeasurement, ProductPropertiesRequest Properties, ProductAdditionalDetailsRequest AdditionalDetails, string? Status, ProductOpeningStockRequest? OpeningStock);
public sealed record UpdateProductRequest(ProductBasicInfoRequest BasicInfo, ProductPricingAndRatesRequest PricingAndRates, ProductStockAndMeasurementRequest StockAndMeasurement, ProductPropertiesRequest Properties, ProductAdditionalDetailsRequest AdditionalDetails, string? Status, ProductOpeningStockRequest? OpeningStock);
