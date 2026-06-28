namespace backend.Features.Reports.Inventory;

// ── Stock Summary (aggregated per item, across warehouses) ────────────────────

public sealed record StockSummaryRowDto(
    Guid ItemId,
    string ItemCode,
    string ItemName,
    Guid? CategoryId,
    string? CategoryName,
    string Uom,
    decimal Quantity,
    decimal Value,
    decimal AverageRate);

public sealed record StockSummaryReportDto(
    decimal TotalQuantity,
    decimal TotalValue,
    IReadOnlyList<StockSummaryRowDto> Rows);

// ── Item-wise Stock (per item, per warehouse) ──────────────────────────────────

public sealed record ItemWiseStockRowDto(
    Guid ItemId,
    string ItemCode,
    string ItemName,
    Guid WarehouseId,
    string WarehouseName,
    decimal Quantity,
    decimal Rate,
    decimal Value);

public sealed record ItemWiseStockReportDto(
    decimal TotalQuantity,
    decimal TotalValue,
    IReadOnlyList<ItemWiseStockRowDto> Rows);

// ── Stock Movement (ledger-style, single item) ─────────────────────────────────

public sealed record StockMovementRowDto(
    Guid Id,
    DateTime PostingDateUtc,
    string MovementType,
    string SourceType,
    string? WarehouseName,
    decimal QuantityChange,
    decimal ValuationRate,
    decimal ValueChange,
    decimal BalanceQuantity,
    decimal BalanceValue,
    string? Remarks);

public sealed record StockMovementReportDto(
    Guid ItemId,
    string ItemName,
    DateOnly FromDate,
    DateOnly ToDate,
    decimal OpeningQuantity,
    decimal OpeningValue,
    decimal ClosingQuantity,
    decimal ClosingValue,
    IReadOnlyList<StockMovementRowDto> Rows);

// ── Inventory Valuation (as-of-date snapshot) ───────────────────────────────────

public sealed record InventoryValuationRowDto(
    Guid ItemId,
    string ItemCode,
    string ItemName,
    Guid? CategoryId,
    string? CategoryName,
    Guid WarehouseId,
    string WarehouseName,
    decimal Quantity,
    decimal Rate,
    decimal Value);

public sealed record InventoryValuationReportDto(
    DateOnly AsOfDate,
    decimal TotalQuantity,
    decimal TotalValue,
    IReadOnlyList<InventoryValuationRowDto> Rows);
