using backend.Features.Masters.Categories;
using backend.Features.Masters.Taxes;
using backend.Features.Masters.Uoms;
using backend.Features.Masters.Vendors;

namespace backend.Features.Masters.Products;

public static class ProductStatuses
{
    public const string Active = "Active";
    public const string Inactive = "Inactive";

    public static readonly string[] All = [Active, Inactive];
}

public sealed class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public ProductBasicInfo BasicInfo { get; set; } = new();

    public ProductPricingAndRates PricingAndRates { get; set; } = new();

    public ProductStockAndMeasurement StockAndMeasurement { get; set; } = new();

    public ProductProperties Properties { get; set; } = new();

    public ProductAdditionalDetails AdditionalDetails { get; set; } = new();

    public string Status { get; set; } = ProductStatuses.Active;

    public ProductOpeningStock? OpeningStock { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class ProductBasicInfo
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? OtherLanguage { get; set; }
    public Guid? TaxId { get; set; }
    public Tax? Tax { get; set; }
}

public sealed class ProductPricingAndRates
{
    public decimal? ProfitPercentage { get; set; }
    public decimal? PurchaseRate { get; set; }
    public decimal? Cost { get; set; }
    public decimal? SalesRate { get; set; }
    public decimal? NormalRate { get; set; }
    public decimal? Mrp { get; set; }
    public decimal? WholesaleRate { get; set; }
}

public sealed class ProductStockAndMeasurement
{
    public string? Hsn { get; set; }
    public Guid BaseUomId { get; set; }
    public Uom? BaseUom { get; set; }
    public Guid PurchaseUomId { get; set; }
    public Uom? PurchaseUom { get; set; }
    public Guid SalesUomId { get; set; }
    public Uom? SalesUom { get; set; }
    public Guid StockUomId { get; set; }
    public Uom? StockUom { get; set; }
    public decimal? MinimumStock { get; set; }
    public decimal? MaximumStock { get; set; }
    public decimal? ReOrderLevel { get; set; }
    public decimal? ReOrderQuantity { get; set; }
}

public sealed class ProductProperties
{
    public ProductGeneralSettings GeneralSettings { get; set; } = new();
    public ProductCategorization Categorization { get; set; } = new();
}

public sealed class ProductGeneralSettings
{
    public bool Inactive { get; set; }
    public bool LessProfit { get; set; }
    public bool CounterItem { get; set; }
    public bool AutoEntry { get; set; }
    public bool HideFromDevice { get; set; }
    public int ExpiryDays { get; set; }
    public bool TaxInclusive { get; set; }
    public bool SerialNo { get; set; }
}

public sealed class ProductCategorization
{
    public Guid? GroupCategoryId { get; set; }
    public Category? GroupCategory { get; set; }
    public Guid? SubGroupCategoryId { get; set; }
    public Category? SubGroupCategory { get; set; }
    public Guid? VendorId { get; set; }
    public Vendor? Vendor { get; set; }
    public string? Brand { get; set; }
}

public sealed class ProductAdditionalDetails
{
    public decimal? PackUnit { get; set; }
    public decimal? AdditionPercentage { get; set; }
    public decimal? Addition { get; set; }
    public string? Company { get; set; }
    public string? WarehouseStock { get; set; }
    public string? Document { get; set; }
    public string? Barcode { get; set; }
    public string? PurchaseHistory { get; set; }
    public string? SalesHistory { get; set; }
    public string? CompanyStock { get; set; }
}

public sealed class ProductOpeningStock
{
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public decimal Quantity { get; set; }
    public DateOnly AsOfDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
