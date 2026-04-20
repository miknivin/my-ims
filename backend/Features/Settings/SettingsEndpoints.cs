using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Settings;

public static class SettingsEndpoints
{
    public static IEndpointRouteBuilder MapSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/settings").WithTags("Settings");

        group.MapGet("/", GetAsync);
        group.MapPut("/", UpdateAsync);

        return app;
    }

    private static IQueryable<AppSettings> BuildQuery(AppDbContext dbContext)
    {
        return dbContext.Settings
            .Include(current => current.InventorySettings.StockControl.DefaultWarehouse);
    }

    private static async Task<IResult> GetAsync(AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var settings = await GetOrCreateSettingsAsync(dbContext, cancellationToken);
        var hydrated = await BuildQuery(dbContext).FirstAsync(current => current.Id == settings.Id, cancellationToken);

        return TypedResults.Ok(new ApiResponse<AppSettingsDto>(true, "Settings fetched successfully.", AppSettingsDto.FromEntity(hydrated)));
    }

    private static async Task<IResult> UpdateAsync(UpdateAppSettingsRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildRequest(request);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        var settings = await GetOrCreateSettingsAsync(dbContext, cancellationToken);

        if (buildResult.InventorySettings.StockControl.DefaultWarehouseId is not null)
        {
            var warehouse = await dbContext.Warehouses.FirstOrDefaultAsync(
                current => current.Id == buildResult.InventorySettings.StockControl.DefaultWarehouseId.Value,
                cancellationToken);

            if (warehouse is null)
            {
                return TypedResults.BadRequest(new ApiResponse<object>(false, "Selected default warehouse does not exist.", null));
            }

            buildResult.InventorySettings.StockControl.DefaultWarehouse = warehouse;
        }

        settings.General = buildResult.General;
        settings.InventorySettings = buildResult.InventorySettings;
        settings.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        var hydrated = await BuildQuery(dbContext).FirstAsync(current => current.Id == settings.Id, cancellationToken);
        return TypedResults.Ok(new ApiResponse<AppSettingsDto>(true, "Settings updated successfully.", AppSettingsDto.FromEntity(hydrated)));
    }

    private static SettingsBuildResult BuildRequest(UpdateAppSettingsRequest request)
    {
        var general = new GeneralSettings
        {
            BusinessName = request.General.BusinessName?.Trim() ?? string.Empty,
            ContactPerson = NormalizeOptional(request.General.ContactPerson),
            Phone = NormalizeOptional(request.General.Phone),
            Email = NormalizeOptional(request.General.Email),
            AddressLine1 = NormalizeOptional(request.General.AddressLine1),
            AddressLine2 = NormalizeOptional(request.General.AddressLine2),
            City = NormalizeOptional(request.General.City),
            State = NormalizeOptional(request.General.State),
            Pincode = NormalizeOptional(request.General.Pincode),
            Country = NormalizeOptional(request.General.Country),
            Gstin = NormalizeOptional(request.General.Gstin),
            Pan = NormalizeOptional(request.General.Pan)
        };

        if (string.IsNullOrWhiteSpace(general.BusinessName))
        {
            return SettingsBuildResult.Invalid("Business name is required.");
        }

        var stockControl = new InventoryStockControlSettings
        {
            AllowNegativeStock = request.InventorySettings.StockControl.AllowNegativeStock,
            TrackInventoryByWarehouse = request.InventorySettings.StockControl.TrackInventoryByWarehouse,
            DefaultWarehouseId = request.InventorySettings.StockControl.DefaultWarehouseId,
            BlockSaleWhenStockUnavailable = request.InventorySettings.StockControl.BlockSaleWhenStockUnavailable,
            AutoUpdateStockOnInvoicePosting = request.InventorySettings.StockControl.AutoUpdateStockOnInvoicePosting
        };

        if (!stockControl.TrackInventoryByWarehouse)
        {
            stockControl.DefaultWarehouseId = null;
        }

        if (request.InventorySettings.Costing.CostPrecision is < 0 or > 6)
        {
            return SettingsBuildResult.Invalid("Cost precision must be between 0 and 6.");
        }

        if (request.InventorySettings.Costing.RoundingPrecision is < 0 or > 6)
        {
            return SettingsBuildResult.Invalid("Rounding precision must be between 0 and 6.");
        }

        var costing = new InventoryCostingSettings
        {
            ValuationMethod = ParseValuationMethod(request.InventorySettings.Costing.ValuationMethod),
            CostPrecision = request.InventorySettings.Costing.CostPrecision,
            RoundingPrecision = request.InventorySettings.Costing.RoundingPrecision,
            IncludeLandedCostInInventoryCost = request.InventorySettings.Costing.IncludeLandedCostInInventoryCost
        };

        var batchSerial = new InventoryBatchSerialSettings
        {
            EnableBatchTracking = request.InventorySettings.BatchSerial.EnableBatchTracking,
            EnableSerialTracking = request.InventorySettings.BatchSerial.EnableSerialTracking,
            RequireExpiryForBatchItems = request.InventorySettings.BatchSerial.RequireExpiryForBatchItems
        };

        if (!batchSerial.EnableBatchTracking)
        {
            batchSerial.RequireExpiryForBatchItems = false;
        }

        return SettingsBuildResult.Valid(general, new InventorySettings
        {
            StockControl = stockControl,
            Costing = costing,
            BatchSerial = batchSerial
        });
    }

    private static InventoryValuationMethod ParseValuationMethod(string? value) => value?.Trim() switch
    {
        "FIFO" => InventoryValuationMethod.FIFO,
        _ => InventoryValuationMethod.MovingAverage
    };

    private static async Task<AppSettings> GetOrCreateSettingsAsync(AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var existing = await BuildQuery(dbContext).FirstOrDefaultAsync(cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        var now = DateTime.UtcNow;
        var settings = new AppSettings
        {
            General = new GeneralSettings
            {
                BusinessName = "My IMS"
            },
            InventorySettings = new InventorySettings
            {
                StockControl = new InventoryStockControlSettings
                {
                    AllowNegativeStock = false,
                    TrackInventoryByWarehouse = true,
                    BlockSaleWhenStockUnavailable = true,
                    AutoUpdateStockOnInvoicePosting = true
                },
                Costing = new InventoryCostingSettings
                {
                    ValuationMethod = InventoryValuationMethod.MovingAverage,
                    CostPrecision = 2,
                    RoundingPrecision = 2,
                    IncludeLandedCostInInventoryCost = true
                },
                BatchSerial = new InventoryBatchSerialSettings()
            },
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.Settings.Add(settings);
        await dbContext.SaveChangesAsync(cancellationToken);
        return settings;
    }

    private static string? NormalizeOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed record SettingsBuildResult(
        string? Error,
        GeneralSettings? General = null,
        InventorySettings? InventorySettings = null)
    {
        public GeneralSettings General { get; init; } = General ?? new GeneralSettings();
        public InventorySettings InventorySettings { get; init; } = InventorySettings ?? new InventorySettings();

        public static SettingsBuildResult Valid(GeneralSettings general, InventorySettings inventorySettings) =>
            new(null, general, inventorySettings);

        public static SettingsBuildResult Invalid(string error) =>
            new(error);
    }
}
