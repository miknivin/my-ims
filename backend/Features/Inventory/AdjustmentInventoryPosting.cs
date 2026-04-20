using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Inventory;

public sealed record InventoryAdjustmentMovement(
    Guid ItemId,
    Guid WarehouseId,
    decimal Quantity,
    decimal Rate,
    string MovementType,
    string? Remarks);

public static class AdjustmentInventoryPosting
{
    public static async Task<string?> ApplyAsync(
        AppDbContext dbContext,
        string sourceType,
        Guid sourceId,
        DateOnly postingDate,
        IReadOnlyList<InventoryAdjustmentMovement> movements,
        CancellationToken cancellationToken)
    {
        if (movements.Count == 0)
        {
            return null;
        }

        var now = DateTime.UtcNow;
        var postingDateUtc = DateTime.SpecifyKind(
            postingDate.ToDateTime(TimeOnly.MinValue),
            DateTimeKind.Utc);

        foreach (var movement in movements)
        {
            if (movement.Quantity <= 0)
            {
                return "Inventory movement quantity must be greater than zero.";
            }

            var balance = await dbContext.InventoryBalances.FirstOrDefaultAsync(
                current => current.ItemId == movement.ItemId && current.WarehouseId == movement.WarehouseId,
                cancellationToken);

            var isInbound = movement.MovementType == StockMovementTypes.AdjustmentIn;
            if (!isInbound && movement.MovementType != StockMovementTypes.AdjustmentOut)
            {
                return "Unsupported inventory movement type.";
            }

            if (!isInbound && balance is null)
            {
                return "Insufficient inventory for the selected warehouse.";
            }

            balance ??= new InventoryBalance
            {
                ItemId = movement.ItemId,
                WarehouseId = movement.WarehouseId
            };

            if (balance.Id == Guid.Empty)
            {
                balance.Id = Guid.NewGuid();
            }

            if (dbContext.Entry(balance).State == EntityState.Detached)
            {
                dbContext.InventoryBalances.Add(balance);
            }

            var valuationRate = isInbound
                ? movement.Rate
                : balance.ValuationRate > 0
                    ? balance.ValuationRate
                    : movement.Rate;

            var quantityChange = isInbound ? movement.Quantity : -movement.Quantity;
            var valueChange = Math.Round(quantityChange * valuationRate, 2, MidpointRounding.AwayFromZero);
            var nextQuantity = Math.Round(balance.QuantityOnHand + quantityChange, 2, MidpointRounding.AwayFromZero);
            if (nextQuantity < 0)
            {
                return "Insufficient inventory for the selected warehouse.";
            }

            var nextValue = Math.Round(balance.TotalValue + valueChange, 2, MidpointRounding.AwayFromZero);
            if (nextQuantity == 0)
            {
                nextValue = 0;
            }

            balance.QuantityOnHand = nextQuantity;
            balance.TotalValue = nextValue;
            balance.ValuationRate = nextQuantity > 0
                ? Math.Round(nextValue / nextQuantity, 4, MidpointRounding.AwayFromZero)
                : 0;
            balance.LastUpdatedAtUtc = now;

            dbContext.StockLedgerEntries.Add(new StockLedgerEntry
            {
                ItemId = movement.ItemId,
                WarehouseId = movement.WarehouseId,
                QuantityChange = quantityChange,
                ValuationRate = valuationRate,
                ValueChange = valueChange,
                MovementType = movement.MovementType,
                SourceType = sourceType,
                SourceId = sourceId,
                PostingDateUtc = postingDateUtc,
                CreatedAtUtc = now,
                BalanceQuantity = balance.QuantityOnHand,
                BalanceValue = balance.TotalValue,
                Remarks = movement.Remarks
            });
        }

        return null;
    }

    public static async Task RevertAsync(
        AppDbContext dbContext,
        string sourceType,
        Guid sourceId,
        CancellationToken cancellationToken)
    {
        var entries = await dbContext.StockLedgerEntries
            .Where(current => current.SourceType == sourceType && current.SourceId == sourceId)
            .OrderByDescending(current => current.PostingDateUtc)
            .ThenByDescending(current => current.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        foreach (var entry in entries)
        {
            var balance = await dbContext.InventoryBalances.FirstOrDefaultAsync(
                current => current.ItemId == entry.ItemId && current.WarehouseId == entry.WarehouseId,
                cancellationToken);

            if (balance is null)
            {
                continue;
            }

            balance.QuantityOnHand = Math.Round(balance.QuantityOnHand - entry.QuantityChange, 2, MidpointRounding.AwayFromZero);
            balance.TotalValue = Math.Round(balance.TotalValue - entry.ValueChange, 2, MidpointRounding.AwayFromZero);
            if (balance.QuantityOnHand <= 0)
            {
                dbContext.InventoryBalances.Remove(balance);
                continue;
            }

            balance.ValuationRate = Math.Round(balance.TotalValue / balance.QuantityOnHand, 4, MidpointRounding.AwayFromZero);
            balance.LastUpdatedAtUtc = DateTime.UtcNow;
        }

        if (entries.Count > 0)
        {
            dbContext.StockLedgerEntries.RemoveRange(entries);
        }
    }
}
