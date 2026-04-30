using backend.Features.Settings;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Inventory;

public sealed record InventoryReceiptPostingLine(
    Guid SourceLineId,
    Guid ItemId,
    Guid WarehouseId,
    decimal Quantity,
    decimal TotalValue,
    string? Remarks);

public sealed record InventoryIssuePostingLine(
    Guid SourceLineId,
    Guid ItemId,
    Guid WarehouseId,
    decimal Quantity,
    string? Remarks);

public sealed record InventoryRevaluationPostingLine(
    Guid SourceLineId,
    Guid ItemId,
    Guid WarehouseId,
    string TargetSourceType,
    Guid TargetSourceId,
    Guid TargetSourceLineId,
    decimal NewUnitRate,
    string? Remarks);

public sealed record InventoryIssueCosting(Guid SourceLineId, decimal CostRate, decimal TotalCost);

public sealed record InventoryIssuePostingResult(string? Error, IReadOnlyDictionary<Guid, InventoryIssueCosting>? Costings = null)
{
    public IReadOnlyDictionary<Guid, InventoryIssueCosting> Costings { get; init; } =
        Costings ?? new Dictionary<Guid, InventoryIssueCosting>();

    public static InventoryIssuePostingResult Success(IReadOnlyDictionary<Guid, InventoryIssueCosting> costings) =>
        new(null, costings);

    public static InventoryIssuePostingResult Failure(string error) =>
        new(error);
}

public static class InventoryPostingService
{
    public static async Task<string?> ApplyReceiptsAsync(
        AppDbContext dbContext,
        EffectiveInventorySettings settings,
        string sourceType,
        Guid sourceId,
        DateOnly postingDate,
        IReadOnlyList<InventoryReceiptPostingLine> lines,
        CancellationToken cancellationToken)
    {
        if (lines.Count == 0)
        {
            return null;
        }

        var now = DateTime.UtcNow;
        var postingDateUtc = ToPostingDateUtc(postingDate);

        foreach (var line in lines)
        {
            if (line.SourceLineId == Guid.Empty)
            {
                return "Inventory receipt source line is required.";
            }

            if (line.ItemId == Guid.Empty || line.WarehouseId == Guid.Empty)
            {
                return "Inventory receipt line is missing product or warehouse.";
            }

            if (line.Quantity <= 0)
            {
                return "Inventory receipt quantity must be greater than zero.";
            }

            var quantity = RoundQuantity(line.Quantity);
            var totalValue = RoundValue(line.TotalValue);
            var unitRate = quantity > 0 ? RoundRate(totalValue / quantity) : 0;

            var balance = await GetOrCreateBalanceAsync(dbContext, line.ItemId, line.WarehouseId, now, cancellationToken);
            balance.QuantityOnHand = RoundQuantity(balance.QuantityOnHand + quantity);
            balance.TotalValue = RoundValue(balance.TotalValue + totalValue);
            balance.ValuationRate = balance.QuantityOnHand > 0
                ? RoundRate(balance.TotalValue / balance.QuantityOnHand)
                : 0;
            balance.LastUpdatedAtUtc = now;

            dbContext.StockLedgerEntries.Add(new StockLedgerEntry
            {
                ItemId = line.ItemId,
                WarehouseId = line.WarehouseId,
                QuantityChange = quantity,
                ValuationRate = unitRate,
                ValueChange = totalValue,
                MovementType = StockMovementTypes.Receipt,
                SourceType = sourceType,
                SourceId = sourceId,
                SourceLineId = line.SourceLineId,
                PostingDateUtc = postingDateUtc,
                CreatedAtUtc = now,
                BalanceQuantity = balance.QuantityOnHand,
                BalanceValue = balance.TotalValue,
                Remarks = line.Remarks
            });

            dbContext.FifoLayers.Add(new FifoLayer
            {
                ItemId = line.ItemId,
                WarehouseId = line.WarehouseId,
                SourceType = sourceType,
                SourceId = sourceId,
                SourceLineId = line.SourceLineId,
                OriginalQuantity = quantity,
                RemainingQuantity = quantity,
                Rate = unitRate,
                PostingDateUtc = postingDateUtc,
                CreatedAtUtc = now
            });
        }

        return null;
    }

    public static async Task<InventoryIssuePostingResult> ApplyIssuesAsync(
        AppDbContext dbContext,
        EffectiveInventorySettings settings,
        string sourceType,
        Guid sourceId,
        DateOnly postingDate,
        IReadOnlyList<InventoryIssuePostingLine> lines,
        CancellationToken cancellationToken)
    {
        if (lines.Count == 0)
        {
            return InventoryIssuePostingResult.Success(new Dictionary<Guid, InventoryIssueCosting>());
        }

        var allowNegativeStock = settings.AllowNegativeStock || !settings.BlockSaleWhenStockUnavailable;
        var now = DateTime.UtcNow;
        var postingDateUtc = ToPostingDateUtc(postingDate);
        var costings = new Dictionary<Guid, InventoryIssueCosting>();

        foreach (var line in lines)
        {
            if (line.SourceLineId == Guid.Empty)
            {
                return InventoryIssuePostingResult.Failure("Inventory issue source line is required.");
            }

            if (line.ItemId == Guid.Empty || line.WarehouseId == Guid.Empty)
            {
                return InventoryIssuePostingResult.Failure("Inventory issue line is missing product or warehouse.");
            }

            if (line.Quantity <= 0)
            {
                return InventoryIssuePostingResult.Failure("Inventory issue quantity must be greater than zero.");
            }

            var quantity = RoundQuantity(line.Quantity);
            var balance = await GetOrCreateBalanceAsync(dbContext, line.ItemId, line.WarehouseId, now, cancellationToken);
            var availableQuantity = RoundQuantity(balance.QuantityOnHand);
            if (!allowNegativeStock && availableQuantity < quantity)
            {
                return InventoryIssuePostingResult.Failure("Insufficient inventory for the selected warehouse.");
            }

            var openLayers = await GetOpenLayersAsync(dbContext, line.ItemId, line.WarehouseId, cancellationToken);
            var remainingToConsume = quantity;
            var availableLayerQuantity = RoundQuantity(openLayers.Sum(current => current.RemainingQuantity));
            if (!allowNegativeStock && availableLayerQuantity < quantity)
            {
                return InventoryIssuePostingResult.Failure("Insufficient inventory for the selected warehouse.");
            }

            var consumptions = new List<InventoryLayerConsumption>();
            decimal issueValue;

            if (settings.ValuationMethod == InventoryValuationMethod.FIFO)
            {
                issueValue = 0;
                foreach (var layer in openLayers)
                {
                    if (remainingToConsume <= 0)
                    {
                        break;
                    }

                    var consumedQuantity = Math.Min(remainingToConsume, layer.RemainingQuantity);
                    if (consumedQuantity <= 0)
                    {
                        continue;
                    }

                    layer.RemainingQuantity = RoundQuantity(layer.RemainingQuantity - consumedQuantity);
                    var consumedValue = RoundValue(consumedQuantity * layer.Rate);
                    issueValue = RoundValue(issueValue + consumedValue);
                    consumptions.Add(new InventoryLayerConsumption
                    {
                        FifoLayerId = layer.Id,
                        FifoLayer = layer,
                        Quantity = RoundQuantity(consumedQuantity),
                        Rate = layer.Rate,
                        Value = consumedValue,
                        CreatedAtUtc = now
                    });
                    remainingToConsume = RoundQuantity(remainingToConsume - consumedQuantity);
                }

                if (remainingToConsume > 0)
                {
                    var fallbackRate = openLayers.LastOrDefault()?.Rate ?? balance.ValuationRate;
                    issueValue = RoundValue(issueValue + RoundValue(remainingToConsume * fallbackRate));
                }
            }
            else
            {
                var unitRate = balance.ValuationRate > 0
                    ? balance.ValuationRate
                    : openLayers.FirstOrDefault()?.Rate ?? 0;
                issueValue = RoundValue(quantity * unitRate);

                foreach (var layer in openLayers)
                {
                    if (remainingToConsume <= 0)
                    {
                        break;
                    }

                    var consumedQuantity = Math.Min(remainingToConsume, layer.RemainingQuantity);
                    if (consumedQuantity <= 0)
                    {
                        continue;
                    }

                    layer.RemainingQuantity = RoundQuantity(layer.RemainingQuantity - consumedQuantity);
                    var consumedValue = RoundValue(consumedQuantity * layer.Rate);
                    consumptions.Add(new InventoryLayerConsumption
                    {
                        FifoLayerId = layer.Id,
                        FifoLayer = layer,
                        Quantity = RoundQuantity(consumedQuantity),
                        Rate = layer.Rate,
                        Value = consumedValue,
                        CreatedAtUtc = now
                    });
                    remainingToConsume = RoundQuantity(remainingToConsume - consumedQuantity);
                }
            }

            balance.QuantityOnHand = RoundQuantity(balance.QuantityOnHand - quantity);
            balance.TotalValue = balance.QuantityOnHand == 0
                ? 0
                : RoundValue(balance.TotalValue - issueValue);
            balance.ValuationRate = balance.QuantityOnHand != 0
                ? RoundRate(balance.TotalValue / balance.QuantityOnHand)
                : 0;
            balance.LastUpdatedAtUtc = now;

            var issueEntry = new StockLedgerEntry
            {
                ItemId = line.ItemId,
                WarehouseId = line.WarehouseId,
                QuantityChange = -quantity,
                ValuationRate = quantity > 0 ? RoundRate(issueValue / quantity) : 0,
                ValueChange = -issueValue,
                MovementType = StockMovementTypes.Issue,
                SourceType = sourceType,
                SourceId = sourceId,
                SourceLineId = line.SourceLineId,
                PostingDateUtc = postingDateUtc,
                CreatedAtUtc = now,
                BalanceQuantity = balance.QuantityOnHand,
                BalanceValue = balance.TotalValue,
                Remarks = line.Remarks
            };

            dbContext.StockLedgerEntries.Add(issueEntry);

            foreach (var consumption in consumptions)
            {
                consumption.IssueStockLedgerEntryId = issueEntry.Id;
                consumption.IssueStockLedgerEntry = issueEntry;
                dbContext.InventoryLayerConsumptions.Add(consumption);
            }

            costings[line.SourceLineId] = new InventoryIssueCosting(
                line.SourceLineId,
                quantity > 0 ? RoundValue(issueValue / quantity) : 0,
                issueValue);
        }

        return InventoryIssuePostingResult.Success(costings);
    }

    public static async Task<string?> ApplyRevaluationsAsync(
        AppDbContext dbContext,
        EffectiveInventorySettings settings,
        string sourceType,
        Guid sourceId,
        DateOnly postingDate,
        IReadOnlyList<InventoryRevaluationPostingLine> lines,
        CancellationToken cancellationToken)
    {
        if (lines.Count == 0)
        {
            return null;
        }

        var now = DateTime.UtcNow;
        var postingDateUtc = ToPostingDateUtc(postingDate);

        foreach (var line in lines)
        {
            if (line.SourceLineId == Guid.Empty)
            {
                return "Inventory revaluation source line is required.";
            }

            var layer = await GetLayerBySourceAsync(
                dbContext,
                line.TargetSourceType,
                line.TargetSourceId,
                line.TargetSourceLineId,
                cancellationToken);
            if (layer is null)
            {
                return "Referenced stock receipt could not be found for revaluation.";
            }

            if (layer.ItemId != line.ItemId || layer.WarehouseId != line.WarehouseId)
            {
                return "Referenced stock receipt does not match the selected product or warehouse.";
            }

            var remainingQuantity = RoundQuantity(layer.RemainingQuantity);
            if (remainingQuantity <= 0)
            {
                continue;
            }

            var balance = await GetOrCreateBalanceAsync(dbContext, line.ItemId, line.WarehouseId, now, cancellationToken);
            var previousRate = layer.Rate;
            var newRate = RoundRate(line.NewUnitRate);
            var valueDelta = RoundValue((newRate - previousRate) * remainingQuantity);

            layer.Rate = newRate;
            balance.TotalValue = RoundValue(balance.TotalValue + valueDelta);
            balance.ValuationRate = balance.QuantityOnHand != 0
                ? RoundRate(balance.TotalValue / balance.QuantityOnHand)
                : 0;
            balance.LastUpdatedAtUtc = now;

            var entry = new StockLedgerEntry
            {
                ItemId = line.ItemId,
                WarehouseId = line.WarehouseId,
                QuantityChange = 0,
                ValuationRate = newRate,
                ValueChange = valueDelta,
                MovementType = StockMovementTypes.Revaluation,
                SourceType = sourceType,
                SourceId = sourceId,
                SourceLineId = line.SourceLineId,
                PostingDateUtc = postingDateUtc,
                CreatedAtUtc = now,
                BalanceQuantity = balance.QuantityOnHand,
                BalanceValue = balance.TotalValue,
                Remarks = line.Remarks
            };

            dbContext.StockLedgerEntries.Add(entry);
            dbContext.InventoryLayerRevaluations.Add(new InventoryLayerRevaluation
            {
                StockLedgerEntryId = entry.Id,
                StockLedgerEntry = entry,
                FifoLayerId = layer.Id,
                FifoLayer = layer,
                QuantityAtRevaluation = remainingQuantity,
                PreviousRate = previousRate,
                NewRate = newRate,
                ValueDelta = valueDelta,
                CreatedAtUtc = now
            });
        }

        return null;
    }

    public static async Task RevertSourceAsync(
        AppDbContext dbContext,
        string sourceType,
        Guid sourceId,
        CancellationToken cancellationToken)
    {
        var entries = await dbContext.StockLedgerEntries
            .Where(current => current.SourceType == sourceType && current.SourceId == sourceId)
            .OrderByDescending(current => current.PostingDateUtc)
            .ThenByDescending(current => current.CreatedAtUtc)
            .ThenByDescending(current => current.Id)
            .ToListAsync(cancellationToken);

        foreach (var entry in entries)
        {
            var balance = await GetOrCreateBalanceAsync(
                dbContext,
                entry.ItemId,
                entry.WarehouseId,
                DateTime.UtcNow,
                cancellationToken);

            switch (entry.MovementType)
            {
                case StockMovementTypes.Issue:
                {
                    var consumptions = await dbContext.InventoryLayerConsumptions
                        .Include(current => current.FifoLayer)
                        .Where(current => current.IssueStockLedgerEntryId == entry.Id)
                        .OrderByDescending(current => current.CreatedAtUtc)
                        .ToListAsync(cancellationToken);

                    foreach (var consumption in consumptions)
                    {
                        if (consumption.FifoLayer is not null)
                        {
                            consumption.FifoLayer.RemainingQuantity = RoundQuantity(
                                consumption.FifoLayer.RemainingQuantity + consumption.Quantity);
                        }
                    }

                    if (consumptions.Count > 0)
                    {
                        dbContext.InventoryLayerConsumptions.RemoveRange(consumptions);
                    }

                    balance.QuantityOnHand = RoundQuantity(balance.QuantityOnHand - entry.QuantityChange);
                    balance.TotalValue = RoundValue(balance.TotalValue - entry.ValueChange);
                    balance.ValuationRate = balance.QuantityOnHand != 0
                        ? RoundRate(balance.TotalValue / balance.QuantityOnHand)
                        : 0;
                    balance.LastUpdatedAtUtc = DateTime.UtcNow;
                    break;
                }

                case StockMovementTypes.Revaluation:
                {
                    var revaluations = await dbContext.InventoryLayerRevaluations
                        .Include(current => current.FifoLayer)
                        .Where(current => current.StockLedgerEntryId == entry.Id)
                        .ToListAsync(cancellationToken);

                    foreach (var revaluation in revaluations)
                    {
                        if (revaluation.FifoLayer is not null)
                        {
                            revaluation.FifoLayer.Rate = revaluation.PreviousRate;
                        }
                    }

                    balance.TotalValue = RoundValue(balance.TotalValue - entry.ValueChange);
                    balance.ValuationRate = balance.QuantityOnHand != 0
                        ? RoundRate(balance.TotalValue / balance.QuantityOnHand)
                        : 0;
                    balance.LastUpdatedAtUtc = DateTime.UtcNow;

                    if (revaluations.Count > 0)
                    {
                        dbContext.InventoryLayerRevaluations.RemoveRange(revaluations);
                    }

                    break;
                }

                default:
                {
                    var layer = await GetLayerBySourceAsync(
                        dbContext,
                        entry.SourceType,
                        entry.SourceId,
                        entry.SourceLineId,
                        cancellationToken);
                    if (layer is not null)
                    {
                        dbContext.FifoLayers.Remove(layer);
                    }

                    balance.QuantityOnHand = RoundQuantity(balance.QuantityOnHand - entry.QuantityChange);
                    balance.TotalValue = RoundValue(balance.TotalValue - entry.ValueChange);
                    balance.ValuationRate = balance.QuantityOnHand != 0
                        ? RoundRate(balance.TotalValue / balance.QuantityOnHand)
                        : 0;
                    balance.LastUpdatedAtUtc = DateTime.UtcNow;
                    break;
                }
            }

            if (balance.QuantityOnHand == 0 && balance.TotalValue == 0)
            {
                dbContext.InventoryBalances.Remove(balance);
            }

            dbContext.StockLedgerEntries.Remove(entry);
        }
    }

    public static Task<bool> HasConsumedLayersAsync(
        AppDbContext dbContext,
        string sourceType,
        Guid sourceId,
        CancellationToken cancellationToken) =>
        dbContext.FifoLayers.AnyAsync(
            current =>
                current.SourceType == sourceType &&
                current.SourceId == sourceId &&
                current.RemainingQuantity < current.OriginalQuantity,
            cancellationToken);

    public static Task<bool> HasPostRevaluationConsumptionAsync(
        AppDbContext dbContext,
        string sourceType,
        Guid sourceId,
        CancellationToken cancellationToken) =>
        dbContext.InventoryLayerRevaluations
            .Include(current => current.FifoLayer)
            .AnyAsync(
                current =>
                    current.StockLedgerEntry != null &&
                    current.StockLedgerEntry.SourceType == sourceType &&
                    current.StockLedgerEntry.SourceId == sourceId &&
                    current.FifoLayer != null &&
                    current.FifoLayer.RemainingQuantity != current.QuantityAtRevaluation,
                cancellationToken);

    private static async Task<InventoryBalance> GetOrCreateBalanceAsync(
        AppDbContext dbContext,
        Guid itemId,
        Guid warehouseId,
        DateTime now,
        CancellationToken cancellationToken)
    {
        var local = dbContext.InventoryBalances.Local
            .FirstOrDefault(current => current.ItemId == itemId && current.WarehouseId == warehouseId);
        if (local is not null)
        {
            return local;
        }

        var balance = await dbContext.InventoryBalances.FirstOrDefaultAsync(
            current => current.ItemId == itemId && current.WarehouseId == warehouseId,
            cancellationToken);
        if (balance is not null)
        {
            return balance;
        }

        balance = new InventoryBalance
        {
            ItemId = itemId,
            WarehouseId = warehouseId,
            LastUpdatedAtUtc = now
        };

        dbContext.InventoryBalances.Add(balance);
        return balance;
    }

    private static async Task<List<FifoLayer>> GetOpenLayersAsync(
        AppDbContext dbContext,
        Guid itemId,
        Guid warehouseId,
        CancellationToken cancellationToken)
    {
        var localLayers = dbContext.FifoLayers.Local
            .Where(current => current.ItemId == itemId && current.WarehouseId == warehouseId)
            .ToList();
        var localIds = localLayers.Select(current => current.Id).ToHashSet();

        var persistedLayers = await dbContext.FifoLayers
            .Where(current =>
                current.ItemId == itemId &&
                current.WarehouseId == warehouseId &&
                current.RemainingQuantity > 0 &&
                !localIds.Contains(current.Id))
            .OrderBy(current => current.PostingDateUtc)
            .ThenBy(current => current.CreatedAtUtc)
            .ThenBy(current => current.Id)
            .ToListAsync(cancellationToken);

        return localLayers
            .Concat(persistedLayers)
            .Where(current => current.RemainingQuantity > 0)
            .OrderBy(current => current.PostingDateUtc)
            .ThenBy(current => current.CreatedAtUtc)
            .ThenBy(current => current.Id)
            .ToList();
    }

    private static async Task<FifoLayer?> GetLayerBySourceAsync(
        AppDbContext dbContext,
        string sourceType,
        Guid sourceId,
        Guid? sourceLineId,
        CancellationToken cancellationToken)
    {
        if (sourceLineId is null)
        {
            return null;
        }

        var local = dbContext.FifoLayers.Local.FirstOrDefault(current =>
            current.SourceType == sourceType &&
            current.SourceId == sourceId &&
            current.SourceLineId == sourceLineId);
        if (local is not null)
        {
            return local;
        }

        return await dbContext.FifoLayers.FirstOrDefaultAsync(
            current =>
                current.SourceType == sourceType &&
                current.SourceId == sourceId &&
                current.SourceLineId == sourceLineId,
            cancellationToken);
    }

    private static DateTime ToPostingDateUtc(DateOnly postingDate) =>
        DateTime.SpecifyKind(postingDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);

    private static decimal RoundQuantity(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private static decimal RoundValue(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private static decimal RoundRate(decimal value) =>
        Math.Round(value, 4, MidpointRounding.AwayFromZero);
}
