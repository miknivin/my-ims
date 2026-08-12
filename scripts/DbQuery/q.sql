SELECT
    p.name              AS product,
    w."Name"            AS warehouse,
    ib."QuantityOnHand",
    ib."ValuationRate",
    ib."TotalValue"
FROM inventory_balances ib
JOIN products p ON p."Id" = ib."ItemId"
JOIN warehouses w ON w."Id" = ib."WarehouseId"
WHERE ib."ItemId" IN (
    SELECT sle."ItemId"
    FROM stock_ledger_entries sle
    WHERE sle."SourceType" = 'DeliveryNote'
)
ORDER BY p.name;
