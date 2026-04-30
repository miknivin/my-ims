using backend.Features.Settings;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Inventory;

public sealed record EffectiveInventorySettings(
    InventoryValuationMethod ValuationMethod,
    bool AllowNegativeStock,
    bool BlockSaleWhenStockUnavailable)
{
    public static readonly EffectiveInventorySettings Default =
        new(InventoryValuationMethod.MovingAverage, false, true);
}

public static class InventorySettingsResolver
{
    public static async Task<EffectiveInventorySettings> GetEffectiveSettingsAsync(
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var settings = await dbContext.Settings
            .AsNoTracking()
            .Select(current => new EffectiveInventorySettings(
                current.InventorySettings.Costing.ValuationMethod == InventoryValuationMethod.FIFO
                    ? InventoryValuationMethod.FIFO
                    : InventoryValuationMethod.MovingAverage,
                current.InventorySettings.StockControl.AllowNegativeStock,
                current.InventorySettings.StockControl.BlockSaleWhenStockUnavailable))
            .FirstOrDefaultAsync(cancellationToken);

        return settings ?? EffectiveInventorySettings.Default;
    }
}
