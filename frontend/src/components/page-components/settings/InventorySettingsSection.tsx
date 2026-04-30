import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import type { SettingsFormState } from "./SettingsFormContext";
import { useSettingsForm } from "./SettingsFormContext";
import { ToggleField, inputClass } from "./settingsShared";

export default function InventorySettingsSection() {
  const {
    state,
    warehouses,
    setInventoryStockControl,
    setInventoryCosting,
    setInventoryBatchSerial,
  } = useSettingsForm();

  return (
    <div className="space-y-6">
      <ComponentCard title="" className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Stock Control
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Set how stock is validated, tracked, and updated during
              inventory-moving transactions.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ToggleField
              checked={state.inventorySettings.stockControl.allowNegativeStock}
              onChange={(value) => setInventoryStockControl({ allowNegativeStock: value })}
              label="Allow Negative Stock"
              description="Permit stock-moving documents to continue even when on-hand quantity drops below zero."
            />
            <ToggleField
              checked={state.inventorySettings.stockControl.trackInventoryByWarehouse}
              onChange={(value) =>
                setInventoryStockControl({
                  trackInventoryByWarehouse: value,
                  defaultWarehouseId: value
                    ? state.inventorySettings.stockControl.defaultWarehouseId
                    : null,
                })
              }
              label="Track Inventory by Warehouse"
              description="Maintain and validate stock separately for each warehouse instead of globally."
            />
            <ToggleField
              checked={
                state.inventorySettings.stockControl.blockSaleWhenStockUnavailable
              }
              onChange={(value) =>
                setInventoryStockControl({ blockSaleWhenStockUnavailable: value })
              }
              label="Block Sale When Stock Is Unavailable"
              description="Prevent sales posting when available stock cannot cover the requested quantity."
            />
            <ToggleField
              checked={
                state.inventorySettings.stockControl.autoUpdateStockOnInvoicePosting
              }
              onChange={(value) =>
                setInventoryStockControl({ autoUpdateStockOnInvoicePosting: value })
              }
              label="Auto Update Stock on Invoice Posting"
              description="Automatically post stock outward when sales invoices are finalized."
            />
          </div>
          <div className="max-w-md">
            <Label htmlFor="defaultWarehouse">Default Warehouse</Label>
            <select
              id="defaultWarehouse"
              className={inputClass}
              value={state.inventorySettings.stockControl.defaultWarehouseId ?? ""}
              disabled={!state.inventorySettings.stockControl.trackInventoryByWarehouse}
              onChange={(event) =>
                setInventoryStockControl({
                  defaultWarehouseId: event.target.value || null,
                })
              }
            >
              <option value="">No default warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="" className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Costing
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Control how inventory cost is valued and rounded across stock-driven
              transactions.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <Label htmlFor="valuationMethod">Valuation Method</Label>
              <select
                id="valuationMethod"
                className={inputClass}
                value={state.inventorySettings.costing.valuationMethod}
                onChange={(event) =>
                  setInventoryCosting({
                    valuationMethod: event.target.value as
                      SettingsFormState["inventorySettings"]["costing"]["valuationMethod"],
                  })
                }
              >
                <option value="Moving Average">Moving Average</option>
                <option value="FIFO">FIFO</option>
              </select>
            </div>
            <div>
              <Label htmlFor="costPrecision">Cost Precision</Label>
              <Input
                id="costPrecision"
                type="number"
                min="0"
                max="6"
                value={state.inventorySettings.costing.costPrecision}
                onChange={(event) =>
                  setInventoryCosting({ costPrecision: event.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="roundingPrecision">Rounding Precision</Label>
              <Input
                id="roundingPrecision"
                type="number"
                min="0"
                max="6"
                value={state.inventorySettings.costing.roundingPrecision}
                onChange={(event) =>
                  setInventoryCosting({ roundingPrecision: event.target.value })
                }
              />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ToggleField
              checked={
                state.inventorySettings.costing.includeLandedCostInInventoryCost
              }
              onChange={(value) =>
                setInventoryCosting({ includeLandedCostInInventoryCost: value })
              }
              label="Include Landed Cost / Additions in Inventory Cost"
              description="Fold additional inward costs into inventory valuation instead of keeping them only as financial adjustments."
            />
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="" className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Batch / Serial
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Enable item-level traceability controls for batch-managed and
              serial-managed inventory.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ToggleField
              checked={state.inventorySettings.batchSerial.enableBatchTracking}
              onChange={(value) =>
                setInventoryBatchSerial({
                  enableBatchTracking: value,
                  requireExpiryForBatchItems: value
                    ? state.inventorySettings.batchSerial.requireExpiryForBatchItems
                    : false,
                })
              }
              label="Enable Batch Tracking"
              description="Track lot or batch references for inventory items that need grouped traceability."
            />
            <ToggleField
              checked={state.inventorySettings.batchSerial.enableSerialTracking}
              onChange={(value) =>
                setInventoryBatchSerial({ enableSerialTracking: value })
              }
              label="Enable Serial Tracking"
              description="Track each unique serial number for controlled items through stock movement."
            />
            <ToggleField
              checked={
                state.inventorySettings.batchSerial.requireExpiryForBatchItems
              }
              disabled={!state.inventorySettings.batchSerial.enableBatchTracking}
              onChange={(value) =>
                setInventoryBatchSerial({ requireExpiryForBatchItems: value })
              }
              label="Require Expiry for Batch Items"
              description="Force expiry capture whenever a batch-tracked item is received or managed."
            />
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
