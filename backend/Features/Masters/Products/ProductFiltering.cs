using backend.Infrastructure.Filtering;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Products;

public sealed class ProductFilterRequest : PagedFilter
{
    public string? Status { get; set; }

    public Guid? TaxId { get; set; }

    public Guid? BaseUomId { get; set; }

    public Guid? GroupCategoryId { get; set; }

    public Guid? SubGroupCategoryId { get; set; }

    public Guid? VendorId { get; set; }
}

public sealed record ProductListItemDto(
    Guid Id,
    ProductBasicInfoDto BasicInfo,
    ProductStockAndMeasurementDto StockAndMeasurement,
    ProductCategorizationDto Categorization,
    string Status,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);

public class ProductSortRegistry : SortRegistryBase<Product>
{
    protected override string DefaultSortKey => "name";

    public ProductSortRegistry()
    {
        Register(
            "name",
            query => query.OrderBy(current => current.BasicInfo.Name).ThenBy(current => current.BasicInfo.Code),
            query => query.OrderByDescending(current => current.BasicInfo.Name).ThenByDescending(current => current.BasicInfo.Code));

        Register(
            "code",
            query => query.OrderBy(current => current.BasicInfo.Code),
            query => query.OrderByDescending(current => current.BasicInfo.Code));

        Register(
            "createdAt",
            query => query.OrderBy(current => current.CreatedAtUtc),
            query => query.OrderByDescending(current => current.CreatedAtUtc));
    }
}

public class GetProductsQueryHandler : FilteredQueryHandlerBase<Product, ProductListItemDto, ProductFilterRequest>
{
    private readonly ProductSortRegistry _sortRegistry;

    public GetProductsQueryHandler(AppDbContext dbContext, ProductSortRegistry sortRegistry)
        : base(dbContext)
    {
        _sortRegistry = sortRegistry;
    }

    protected override IQueryable<Product> BuildBaseQuery() => DbContext.Products;

    protected override IQueryable<Product> ApplyKeyword(IQueryable<Product> query, ProductFilterRequest filter)
    {
        if (string.IsNullOrWhiteSpace(filter.Keyword))
        {
            return query;
        }

        var pattern = $"%{filter.Keyword.Trim()}%";
        return query.Where(current =>
            EF.Functions.ILike(current.BasicInfo.Code, pattern) ||
            EF.Functions.ILike(current.BasicInfo.Name, pattern) ||
            (current.AdditionalDetails.Barcode != null && EF.Functions.ILike(current.AdditionalDetails.Barcode, pattern)) ||
            (current.Properties.Categorization.Brand != null && EF.Functions.ILike(current.Properties.Categorization.Brand, pattern)) ||
            (current.BasicInfo.Tax != null && (
                EF.Functions.ILike(current.BasicInfo.Tax.Name, pattern) ||
                EF.Functions.ILike(current.BasicInfo.Tax.Code, pattern))) ||
            (current.Properties.Categorization.GroupCategory != null && EF.Functions.ILike(current.Properties.Categorization.GroupCategory.Name, pattern)) ||
            (current.Properties.Categorization.SubGroupCategory != null && EF.Functions.ILike(current.Properties.Categorization.SubGroupCategory.Name, pattern)) ||
            (current.Properties.Categorization.Vendor != null && EF.Functions.ILike(current.Properties.Categorization.Vendor.BasicInfo.Name, pattern)));
    }

    protected override IQueryable<Product> ApplyFilters(IQueryable<Product> query, ProductFilterRequest filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            query = query.Where(current => current.Status == filter.Status);
        }

        if (filter.TaxId is not null)
        {
            query = query.Where(current => current.BasicInfo.TaxId == filter.TaxId);
        }

        if (filter.BaseUomId is not null)
        {
            query = query.Where(current => current.StockAndMeasurement.BaseUomId == filter.BaseUomId);
        }

        if (filter.GroupCategoryId is not null)
        {
            query = query.Where(current => current.Properties.Categorization.GroupCategoryId == filter.GroupCategoryId);
        }

        if (filter.SubGroupCategoryId is not null)
        {
            query = query.Where(current => current.Properties.Categorization.SubGroupCategoryId == filter.SubGroupCategoryId);
        }

        if (filter.VendorId is not null)
        {
            query = query.Where(current => current.Properties.Categorization.VendorId == filter.VendorId);
        }

        return query;
    }

    protected override IQueryable<Product> ApplySorting(IQueryable<Product> query, ProductFilterRequest filter) =>
        _sortRegistry.Apply(query, filter.SortBy);

    protected override IQueryable<ProductListItemDto> Project(IQueryable<Product> query)
    {
        return query.Select(current => new ProductListItemDto(
            current.Id,
            new ProductBasicInfoDto(
                current.BasicInfo.Code,
                current.BasicInfo.Name,
                current.BasicInfo.OtherLanguage,
                current.BasicInfo.TaxId,
                current.BasicInfo.Tax != null ? current.BasicInfo.Tax.Name : null),
            new ProductStockAndMeasurementDto(
                current.StockAndMeasurement.Hsn,
                current.StockAndMeasurement.BaseUomId,
                current.StockAndMeasurement.BaseUom != null ? current.StockAndMeasurement.BaseUom.Name : string.Empty,
                current.StockAndMeasurement.PurchaseUomId,
                current.StockAndMeasurement.PurchaseUom != null ? current.StockAndMeasurement.PurchaseUom.Name : string.Empty,
                current.StockAndMeasurement.SalesUomId,
                current.StockAndMeasurement.SalesUom != null ? current.StockAndMeasurement.SalesUom.Name : string.Empty,
                current.StockAndMeasurement.StockUomId,
                current.StockAndMeasurement.StockUom != null ? current.StockAndMeasurement.StockUom.Name : string.Empty,
                current.StockAndMeasurement.MinimumStock,
                current.StockAndMeasurement.MaximumStock,
                current.StockAndMeasurement.ReOrderLevel,
                current.StockAndMeasurement.ReOrderQuantity),
            new ProductCategorizationDto(
                current.Properties.Categorization.GroupCategoryId,
                current.Properties.Categorization.GroupCategory != null ? current.Properties.Categorization.GroupCategory.Name : null,
                current.Properties.Categorization.SubGroupCategoryId,
                current.Properties.Categorization.SubGroupCategory != null ? current.Properties.Categorization.SubGroupCategory.Name : null,
                current.Properties.Categorization.VendorId,
                current.Properties.Categorization.Vendor != null ? current.Properties.Categorization.Vendor.BasicInfo.Name : null,
                current.Properties.Categorization.Brand),
            current.Status,
            current.CreatedAtUtc,
            current.UpdatedAtUtc));
    }
}
