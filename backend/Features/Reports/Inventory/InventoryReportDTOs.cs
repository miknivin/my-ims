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

// ── Item-wise Stock (period movement per item, aggregated across warehouses) ────

public sealed record ItemWiseStockRowDto(
    Guid ItemId,
    string ItemCode,
    string ItemName,
    string? CategoryName,
    string Uom,
    decimal OpeningQty,
    decimal InwardQty,
    decimal OutwardQty,
    decimal ClosingQty,
    decimal ClosingRate,
    decimal ClosingValue);

public sealed record ItemWiseStockReportDto(
    DateOnly FromDate,
    DateOnly ToDate,
    decimal TotalClosingQty,
    decimal TotalClosingValue,
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

// ── Stock Statement (period-based: opening → inward → outward → closing) ─────────

public sealed record StockStatementRowDto(
    Guid ItemId,
    string ItemCode,
    string ItemName,
    string? CategoryName,
    string? WarehouseName,
    string Uom,
    decimal OpeningQty,
    decimal OpeningValue,
    decimal InwardQty,
    decimal InwardValue,
    decimal OutwardQty,
    decimal OutwardValue,
    decimal ClosingQty,
    decimal ClosingValue,
    decimal ClosingRate);

public sealed record StockStatementReportDto(
    DateOnly FromDate,
    DateOnly ToDate,
    string GroupBy,
    decimal TotalOpeningValue,
    decimal TotalInwardValue,
    decimal TotalOutwardValue,
    decimal TotalClosingValue,
    IReadOnlyList<StockStatementRowDto> Rows);

// ── Stock Summary Enhanced (groupBy: category | warehouse, optional asOfDate) ───

public sealed record StockSummaryEnhancedRowDto(
    Guid ItemId,
    string ItemCode,
    string ItemName,
    string? CategoryName,
    string? WarehouseName,
    string Uom,
    decimal Quantity);

public sealed record StockSummaryEnhancedReportDto(
    string GroupBy,
    DateOnly? AsOfDate,
    decimal TotalQuantity,
    IReadOnlyList<StockSummaryEnhancedRowDto> Rows);

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
    string GroupBy,
    decimal TotalQuantity,
    decimal TotalValue,
    IReadOnlyList<InventoryValuationRowDto> Rows);
