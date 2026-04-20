using backend.Features.Masters.Categories;
using backend.Features.Masters.Taxes;
using backend.Features.Masters.Uoms;
using backend.Features.Masters.Vendors;
using backend.Infrastructure.Filtering;
using backend.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Products;

public static class ProductEndpoints
{
    public static IEndpointRouteBuilder MapProductEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/products").WithTags("Product Masters");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPut("/{id:guid}", UpdateAsync);
        group.MapDelete("/{id:guid}", DeleteAsync);

        return app;
    }

    private static IQueryable<Product> BuildQuery(AppDbContext dbContext)
    {
        return dbContext.Products
            .Include(current => current.OpeningStock)
            .Include(current => current.BasicInfo.Tax)
            .Include(current => current.StockAndMeasurement.BaseUom)
            .Include(current => current.StockAndMeasurement.PurchaseUom)
            .Include(current => current.StockAndMeasurement.SalesUom)
            .Include(current => current.StockAndMeasurement.StockUom)
            .Include(current => current.Properties.Categorization.GroupCategory)
            .Include(current => current.Properties.Categorization.SubGroupCategory)
            .Include(current => current.Properties.Categorization.Vendor);
    }

    private static async Task<IResult> GetAllAsync([AsParameters] ProductFilterRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var handler = new GetProductsQueryHandler(dbContext, new ProductSortRegistry());
        var products = await handler.HandleAsync(request, cancellationToken);

        return TypedResults.Ok(new ApiResponse<PagedResponse<ProductListItemDto>>(true, "Product list fetched successfully.", products));
    }

    private static async Task<IResult> GetByIdAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var product = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return product is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Product not found.", null))
            : TypedResults.Ok(new ApiResponse<ProductDto>(true, "Product fetched successfully.", ProductDto.FromEntity(product)));
    }

    private static async Task<IResult> CreateAsync(CreateProductRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildProductRequest(
            request.BasicInfo,
            request.PricingAndRates,
            request.StockAndMeasurement,
            request.Properties,
            request.AdditionalDetails,
            request.Status,
            request.OpeningStock);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.Products.AnyAsync(current => current.BasicInfo.Code == buildResult.BasicInfo.Code || current.BasicInfo.Name == buildResult.BasicInfo.Name, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Product with this code or name already exists.", null));
        }

        var resolutionError = await PopulateReferencesAsync(dbContext, buildResult.BasicInfo, buildResult.StockAndMeasurement, buildResult.Properties, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        var now = DateTime.UtcNow;
        var product = new Product
        {
            BasicInfo = buildResult.BasicInfo,
            PricingAndRates = buildResult.PricingAndRates,
            StockAndMeasurement = buildResult.StockAndMeasurement,
            Properties = buildResult.Properties,
            AdditionalDetails = buildResult.AdditionalDetails,
            Status = buildResult.Status,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        if (buildResult.OpeningStock is not null)
        {
            product.OpeningStock = new ProductOpeningStock
            {
                ProductId = product.Id,
                Quantity = buildResult.OpeningStock.Quantity,
                AsOfDate = buildResult.OpeningStock.AsOfDate,
                CreatedAtUtc = now,
                UpdatedAtUtc = now
            };
        }

        dbContext.Products.Add(product);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Created($"/api/masters/products/{product.Id}", new ApiResponse<ProductDto>(true, "Product created successfully.", ProductDto.FromEntity(product)));
    }

    private static async Task<IResult> UpdateAsync(Guid id, UpdateProductRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildProductRequest(
            request.BasicInfo,
            request.PricingAndRates,
            request.StockAndMeasurement,
            request.Properties,
            request.AdditionalDetails,
            request.Status,
            request.OpeningStock);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        var product = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (product is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Product not found.", null));
        }

        if (await dbContext.Products.AnyAsync(current => current.Id != id && (current.BasicInfo.Code == buildResult.BasicInfo.Code || current.BasicInfo.Name == buildResult.BasicInfo.Name), cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Product with this code or name already exists.", null));
        }

        var resolutionError = await PopulateReferencesAsync(dbContext, buildResult.BasicInfo, buildResult.StockAndMeasurement, buildResult.Properties, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        product.BasicInfo = buildResult.BasicInfo;
        product.PricingAndRates = buildResult.PricingAndRates;
        product.StockAndMeasurement = buildResult.StockAndMeasurement;
        product.Properties = buildResult.Properties;
        product.AdditionalDetails = buildResult.AdditionalDetails;
        product.Status = buildResult.Status;
        product.UpdatedAtUtc = DateTime.UtcNow;

        if (buildResult.OpeningStock is null)
        {
            if (product.OpeningStock is not null)
            {
                dbContext.ProductOpeningStocks.Remove(product.OpeningStock);
                product.OpeningStock = null;
            }
        }
        else if (product.OpeningStock is null)
        {
            product.OpeningStock = new ProductOpeningStock
            {
                ProductId = product.Id,
                Quantity = buildResult.OpeningStock.Quantity,
                AsOfDate = buildResult.OpeningStock.AsOfDate,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };
        }
        else
        {
            product.OpeningStock.Quantity = buildResult.OpeningStock.Quantity;
            product.OpeningStock.AsOfDate = buildResult.OpeningStock.AsOfDate;
            product.OpeningStock.UpdatedAtUtc = DateTime.UtcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<ProductDto>(true, "Product updated successfully.", ProductDto.FromEntity(product)));
    }

    private static async Task<IResult> DeleteAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var product = await dbContext.Products.Include(current => current.OpeningStock).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (product is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Product not found.", null));
        }

        dbContext.Products.Remove(product);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Product deleted successfully.", null));
    }

    private static ProductRequestBuildResult BuildProductRequest(
        ProductBasicInfoRequest basicInfoRequest,
        ProductPricingAndRatesRequest pricingRequest,
        ProductStockAndMeasurementRequest stockRequest,
        ProductPropertiesRequest propertiesRequest,
        ProductAdditionalDetailsRequest detailsRequest,
        string? status,
        ProductOpeningStockRequest? openingStockRequest)
    {
        var basicInfo = new ProductBasicInfo
        {
            Code = basicInfoRequest.Code?.Trim().ToUpperInvariant() ?? string.Empty,
            Name = basicInfoRequest.Name?.Trim() ?? string.Empty,
            OtherLanguage = NormalizeOptional(basicInfoRequest.OtherLanguage),
            TaxId = basicInfoRequest.TaxId
        };

        var pricing = NormalizePricing(pricingRequest);
        var stock = new ProductStockAndMeasurement
        {
            Hsn = NormalizeOptional(stockRequest.Hsn),
            BaseUomId = stockRequest.BaseUomId,
            PurchaseUomId = stockRequest.PurchaseUomId,
            SalesUomId = stockRequest.SalesUomId,
            StockUomId = stockRequest.StockUomId,
            MinimumStock = stockRequest.MinimumStock,
            MaximumStock = stockRequest.MaximumStock,
            ReOrderLevel = stockRequest.ReOrderLevel,
            ReOrderQuantity = stockRequest.ReOrderQuantity
        };
        var properties = NormalizeProperties(propertiesRequest);
        var details = NormalizeDetails(detailsRequest);
        var normalizedStatus = string.IsNullOrWhiteSpace(status) ? ProductStatuses.Active : status.Trim();
        var openingStock = openingStockRequest;

        if (string.IsNullOrWhiteSpace(basicInfo.Code))
        {
            return new ProductRequestBuildResult("Product code is required.");
        }

        if (basicInfo.Code.Length is < 2 or > 20)
        {
            return new ProductRequestBuildResult("Product code must be between 2 and 20 characters.");
        }

        if (string.IsNullOrWhiteSpace(basicInfo.Name))
        {
            return new ProductRequestBuildResult("Product name is required.");
        }

        if (basicInfo.Name.Length is < 3 or > 150)
        {
            return new ProductRequestBuildResult("Product name must be between 3 and 150 characters.");
        }

        if (stock.BaseUomId == Guid.Empty || stock.PurchaseUomId == Guid.Empty || stock.SalesUomId == Guid.Empty || stock.StockUomId == Guid.Empty)
        {
            return new ProductRequestBuildResult("Base, purchase, sales, and stock UOM are required.");
        }

        if (stock.MinimumStock is < 0 || stock.MaximumStock is < 0 || stock.ReOrderLevel is < 0 || stock.ReOrderQuantity is < 0)
        {
            return new ProductRequestBuildResult("Stock values cannot be negative.");
        }

        if (!ProductStatuses.All.Contains(normalizedStatus, StringComparer.OrdinalIgnoreCase))
        {
            return new ProductRequestBuildResult("Status must be either Active or Inactive.");
        }

        if (openingStockRequest is not null && openingStockRequest.Quantity < 0)
        {
            return new ProductRequestBuildResult("Opening stock quantity cannot be negative.");
        }

        var requestedStatus = normalizedStatus;
        normalizedStatus = ProductStatuses.All.First(value => value.Equals(requestedStatus, StringComparison.OrdinalIgnoreCase));
        return new ProductRequestBuildResult(
            null,
            basicInfo,
            pricing,
            stock,
            properties,
            details,
            normalizedStatus,
            openingStock);
    }

    private static ProductPricingAndRates NormalizePricing(ProductPricingAndRatesRequest request)
    {
        return new ProductPricingAndRates
        {
            ProfitPercentage = request.ProfitPercentage,
            PurchaseRate = request.PurchaseRate,
            Cost = request.Cost,
            SalesRate = request.SalesRate,
            NormalRate = request.NormalRate,
            Mrp = request.Mrp,
            WholesaleRate = request.WholesaleRate
        };
    }

    private static ProductProperties NormalizeProperties(ProductPropertiesRequest request)
    {
        return new ProductProperties
        {
            GeneralSettings = new ProductGeneralSettings
            {
                Inactive = request.GeneralSettings.Inactive,
                LessProfit = request.GeneralSettings.LessProfit,
                CounterItem = request.GeneralSettings.CounterItem,
                AutoEntry = request.GeneralSettings.AutoEntry,
                HideFromDevice = request.GeneralSettings.HideFromDevice,
                ExpiryDays = request.GeneralSettings.ExpiryDays,
                TaxInclusive = request.GeneralSettings.TaxInclusive,
                SerialNo = request.GeneralSettings.SerialNo
            },
            Categorization = new ProductCategorization
            {
                GroupCategoryId = request.Categorization.GroupCategoryId,
                SubGroupCategoryId = request.Categorization.SubGroupCategoryId,
                VendorId = request.Categorization.VendorId,
                Brand = NormalizeOptional(request.Categorization.Brand)
            }
        };
    }

    private static ProductAdditionalDetails NormalizeDetails(ProductAdditionalDetailsRequest request)
    {
        return new ProductAdditionalDetails
        {
            PackUnit = request.PackUnit,
            AdditionPercentage = request.AdditionPercentage,
            Addition = request.Addition,
            Company = NormalizeOptional(request.Company),
            WarehouseStock = NormalizeOptional(request.WarehouseStock),
            Document = NormalizeOptional(request.Document),
            Barcode = NormalizeOptional(request.Barcode),
            PurchaseHistory = NormalizeOptional(request.PurchaseHistory),
            SalesHistory = NormalizeOptional(request.SalesHistory),
            CompanyStock = NormalizeOptional(request.CompanyStock)
        };
    }

    private static async Task<string?> PopulateReferencesAsync(AppDbContext dbContext, ProductBasicInfo basicInfo, ProductStockAndMeasurement stock, ProductProperties properties, CancellationToken cancellationToken)
    {
        if (basicInfo.TaxId is not null)
        {
            basicInfo.Tax = await dbContext.Taxes.FirstOrDefaultAsync(current => current.Id == basicInfo.TaxId.Value, cancellationToken);
            if (basicInfo.Tax is null)
            {
                return "Selected tax does not exist.";
            }
        }

        stock.BaseUom = await dbContext.Uoms.FirstOrDefaultAsync(current => current.Id == stock.BaseUomId, cancellationToken);
        stock.PurchaseUom = await dbContext.Uoms.FirstOrDefaultAsync(current => current.Id == stock.PurchaseUomId, cancellationToken);
        stock.SalesUom = await dbContext.Uoms.FirstOrDefaultAsync(current => current.Id == stock.SalesUomId, cancellationToken);
        stock.StockUom = await dbContext.Uoms.FirstOrDefaultAsync(current => current.Id == stock.StockUomId, cancellationToken);

        if (stock.BaseUom is null || stock.PurchaseUom is null || stock.SalesUom is null || stock.StockUom is null)
        {
            return "One or more selected UOMs do not exist.";
        }

        if (properties.Categorization.GroupCategoryId is not null)
        {
            properties.Categorization.GroupCategory = await dbContext.Categories.FirstOrDefaultAsync(current => current.Id == properties.Categorization.GroupCategoryId.Value, cancellationToken);
            if (properties.Categorization.GroupCategory is null)
            {
                return "Selected group category does not exist.";
            }
        }

        if (properties.Categorization.SubGroupCategoryId is not null)
        {
            properties.Categorization.SubGroupCategory = await dbContext.Categories.FirstOrDefaultAsync(current => current.Id == properties.Categorization.SubGroupCategoryId.Value, cancellationToken);
            if (properties.Categorization.SubGroupCategory is null)
            {
                return "Selected sub-group category does not exist.";
            }
        }

        if (properties.Categorization.VendorId is not null)
        {
            properties.Categorization.Vendor = await dbContext.Vendors.FirstOrDefaultAsync(current => current.Id == properties.Categorization.VendorId.Value, cancellationToken);
            if (properties.Categorization.Vendor is null)
            {
                return "Selected vendor does not exist.";
            }
        }

        return null;
    }

    private static string? NormalizeOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed record ProductRequestBuildResult(
        string? Error,
        ProductBasicInfo? BasicInfo = null,
        ProductPricingAndRates? PricingAndRates = null,
        ProductStockAndMeasurement? StockAndMeasurement = null,
        ProductProperties? Properties = null,
        ProductAdditionalDetails? AdditionalDetails = null,
        string Status = "",
        ProductOpeningStockRequest? OpeningStock = null)
    {
        public ProductBasicInfo BasicInfo { get; init; } = BasicInfo ?? new ProductBasicInfo();
        public ProductPricingAndRates PricingAndRates { get; init; } = PricingAndRates ?? new ProductPricingAndRates();
        public ProductStockAndMeasurement StockAndMeasurement { get; init; } = StockAndMeasurement ?? new ProductStockAndMeasurement();
        public ProductProperties Properties { get; init; } = Properties ?? new ProductProperties();
        public ProductAdditionalDetails AdditionalDetails { get; init; } = AdditionalDetails ?? new ProductAdditionalDetails();
    }
}
