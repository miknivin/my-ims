import { ReactNode, useMemo } from "react";
import { Warehouse } from "../../../../../app/api/warehouseApi";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import { TransactionLineColumnDefinition } from "../../shared/transactionLineItems";
import {
  PURCHASE_ADJUSTMENT_NOTE_LINE_COLUMNS,
  PurchaseAdjustmentNoteLineColumnKey,
  PurchaseAdjustmentNoteLineColumnMeta,
} from "../lineItemColumns";
import { PurchaseAdjustmentNoteLineState } from "../types/types";

export interface PurchaseAdjustmentNoteLineColumnRenderContext {
  line: PurchaseAdjustmentNoteLineState;
  warehouses: Warehouse[];
  onChange: (
    rowId: string,
    patch: Partial<PurchaseAdjustmentNoteLineState>,
  ) => void;
}

export interface PurchaseAdjustmentNoteLineColumnDefinition
  extends TransactionLineColumnDefinition<
      PurchaseAdjustmentNoteLineState,
      PurchaseAdjustmentNoteLineColumnRenderContext,
      PurchaseAdjustmentNoteLineColumnKey
    >,
    PurchaseAdjustmentNoteLineColumnMeta {
  sortable: boolean;
  getSortValue: (line: PurchaseAdjustmentNoteLineState) => string | number;
  renderCell: (
    context: PurchaseAdjustmentNoteLineColumnRenderContext,
  ) => ReactNode;
}

const inputClass =
  "h-10 w-full truncate rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

function formatReadonlyValue(value: string | number | null) {
  if (typeof value === "number") {
    return value.toFixed(2);
  }

  return value ?? "";
}

export function usePurchaseAdjustmentNoteLineColumns() {
  return useMemo<PurchaseAdjustmentNoteLineColumnDefinition[]>(() => {
    const sortAccessors: Record<
      PurchaseAdjustmentNoteLineColumnKey,
      (line: PurchaseAdjustmentNoteLineState) => string | number
    > = {
      productCodeSnapshot: (line) => line.productCodeSnapshot,
      productNameSnapshot: (line) => line.productNameSnapshot,
      hsnCode: (line) => line.hsnCode,
      quantity: (line) => Number.parseFloat(line.quantity) || 0,
      foc: (line) => Number.parseFloat(line.foc) || 0,
      unitName: (line) => line.unitName,
      rate: (line) => Number.parseFloat(line.rate) || 0,
      grossAmount: (line) => line.grossAmount,
      discountPercent: (line) => Number.parseFloat(line.discountPercent) || 0,
      discountAmount: (line) => line.discountAmount,
      taxableAmount: (line) => line.taxableAmount,
      taxPercent: (line) => Number.parseFloat(line.taxPercent) || 0,
      taxAmount: (line) => line.taxAmount,
      cost: (line) => line.cost,
      sellingRate: (line) => Number.parseFloat(line.sellingRate) || 0,
      profitPercent: (line) => line.profitPercent,
      profitAmount: (line) => line.profitAmount,
      wholesaleRate: (line) => Number.parseFloat(line.wholesaleRate) || 0,
      mrp: (line) => Number.parseFloat(line.mrp) || 0,
      warehouseId: (line) => line.warehouseName,
      lineTotal: (line) => line.lineTotal,
    };

    const renderers: Record<
      PurchaseAdjustmentNoteLineColumnKey,
      PurchaseAdjustmentNoteLineColumnDefinition["renderCell"]
    > = {
      productCodeSnapshot: ({ line }) => (
        <div className="truncate px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.productCodeSnapshot)}
        </div>
      ),
      productNameSnapshot: ({ line }) => (
        <div className="truncate px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.productNameSnapshot)}
        </div>
      ),
      hsnCode: ({ line }) => (
        <div className="truncate px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.hsnCode)}
        </div>
      ),
      quantity: ({ line, onChange }) => (
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          value={line.quantity}
          onChange={(event) =>
            onChange(line.rowId, { quantity: event.target.value })
          }
        />
      ),
      foc: ({ line, onChange }) => (
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          value={line.foc}
          onChange={(event) => onChange(line.rowId, { foc: event.target.value })}
        />
      ),
      unitName: ({ line }) => (
        <div className="truncate px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.unitName)}
        </div>
      ),
      rate: ({ line, onChange }) => (
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          value={line.rate}
          onChange={(event) => onChange(line.rowId, { rate: event.target.value })}
        />
      ),
      grossAmount: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.grossAmount)}
        </div>
      ),
      discountPercent: ({ line, onChange }) => (
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          value={line.discountPercent}
          onChange={(event) =>
            onChange(line.rowId, { discountPercent: event.target.value })
          }
        />
      ),
      discountAmount: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.discountAmount)}
        </div>
      ),
      taxableAmount: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.taxableAmount)}
        </div>
      ),
      taxPercent: ({ line, onChange }) => (
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          value={line.taxPercent}
          onChange={(event) =>
            onChange(line.rowId, { taxPercent: event.target.value })
          }
        />
      ),
      taxAmount: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.taxAmount)}
        </div>
      ),
      cost: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.cost)}
        </div>
      ),
      sellingRate: ({ line, onChange }) => (
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          value={line.sellingRate}
          onChange={(event) =>
            onChange(line.rowId, { sellingRate: event.target.value })
          }
        />
      ),
      profitPercent: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.profitPercent)}
        </div>
      ),
      profitAmount: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.profitAmount)}
        </div>
      ),
      wholesaleRate: ({ line, onChange }) => (
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          value={line.wholesaleRate}
          onChange={(event) =>
            onChange(line.rowId, { wholesaleRate: event.target.value })
          }
        />
      ),
      mrp: ({ line, onChange }) => (
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          value={line.mrp}
          onChange={(event) => onChange(line.rowId, { mrp: event.target.value })}
        />
      ),
      warehouseId: ({ line, onChange, warehouses }) => (
        <AutocompleteSelect
          value={
            warehouses.find((warehouse) => warehouse.id === line.warehouseId)
              ?.name ?? line.warehouseName
          }
          className="bg-transparent text-xs"
          placeholder="Search warehouse"
          search={async (keyword) => {
            const normalizedKeyword = keyword.trim().toLowerCase();

            return warehouses
              .filter((warehouse) =>
                [
                  warehouse.name,
                  warehouse.code,
                  warehouse.contactPerson ?? "",
                ].some((value) =>
                  value.toLowerCase().includes(normalizedKeyword),
                ),
              )
              .slice(0, 10);
          }}
          getItems={(result) => result}
          getOptionKey={(item) => item.id}
          getOptionLabel={(item) =>
            item.code ? `${item.name} (${item.code})` : item.name
          }
          onInputChange={(value) =>
            onChange(line.rowId, {
              warehouseId: null,
              warehouseName: value,
            })
          }
          onSelect={(item) =>
            onChange(line.rowId, {
              warehouseId: item?.id ?? null,
              warehouseName: item?.name ?? "",
            })
          }
        />
      ),
      lineTotal: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-sm font-semibold text-gray-800 dark:text-white/90">
          {formatReadonlyValue(line.lineTotal)}
        </div>
      ),
    };

    return PURCHASE_ADJUSTMENT_NOTE_LINE_COLUMNS.map((column) => ({
      ...column,
      sortable: true,
      getSortValue: sortAccessors[column.key],
      renderCell: renderers[column.key],
    }));
  }, []);
}
