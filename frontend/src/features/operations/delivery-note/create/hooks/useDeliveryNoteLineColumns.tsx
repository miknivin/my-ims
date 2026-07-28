import { ReactNode, useMemo } from "react";
import { Uom } from "@/redux/api/uomApi";
import { Warehouse } from "@/redux/api/warehouseApi";
import {
  ProductListItem,
  useLazyGetProductByIdQuery,
  useLazyGetProductsQuery,
} from "@/redux/api/productApi";
import { useQuickAddProductContext } from "@/shared/providers/QuickAddProductProvider";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import { TransactionLineColumnDefinition } from "@/features/operations/shared/transactionLineItems";
import {
  DELIVERY_NOTE_LINE_COLUMNS,
  DeliveryNoteLineColumnKey,
  DeliveryNoteLineColumnMeta,
} from "../lineItemColumns";
import { DeliveryNoteLineState } from "../types/types";

export interface DeliveryNoteLineColumnRenderContext {
  line: DeliveryNoteLineState;
  uoms: Uom[];
  warehouses: Warehouse[];
  onChange: (rowId: string, patch: Partial<DeliveryNoteLineState>) => void;
}

export interface DeliveryNoteLineColumnDefinition
  extends TransactionLineColumnDefinition<
      DeliveryNoteLineState,
      DeliveryNoteLineColumnRenderContext,
      DeliveryNoteLineColumnKey
    >,
    DeliveryNoteLineColumnMeta {
  sortable: boolean;
  getSortValue: (line: DeliveryNoteLineState) => string | number;
  renderCell: (context: DeliveryNoteLineColumnRenderContext) => ReactNode;
}

const inputClass =
  "h-10 w-full truncate rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

function formatReadonlyValue(value: string | number | null) {
  if (typeof value === "number") return value.toFixed(2);
  return value ?? "";
}

export function useDeliveryNoteLineColumns() {
  const [searchProducts] = useLazyGetProductsQuery();
  const [getProductById] = useLazyGetProductByIdQuery();
  const { openProductQuickAdd } = useQuickAddProductContext();

  return useMemo<DeliveryNoteLineColumnDefinition[]>(() => {
    const sortAccessors: Record<
      DeliveryNoteLineColumnKey,
      (line: DeliveryNoteLineState) => string | number
    > = {
      productNameSnapshot: (line) => line.productNameSnapshot,
      hsnCode: (line) => line.hsnCode,
      warehouseId: (line) => line.warehouseName,
      unitId: (line) => line.unitName,
      rate: (line) => Number.parseFloat(line.rate) || 0,
      quantity: (line) => Number.parseFloat(line.quantity) || 0,
      grossAmount: (line) => line.grossAmount,
      discountPercent: (line) => Number.parseFloat(line.discountPercent) || 0,
      discountAmount: (line) => line.discountAmount,
      total: (line) => line.total,
      remark: (line) => line.remark,
    };

    const renderers: Record<
      DeliveryNoteLineColumnKey,
      DeliveryNoteLineColumnDefinition["renderCell"]
    > = {
      productNameSnapshot: ({ line, onChange }) => (
        <AutocompleteSelect
          value={line.productNameSnapshot}
          className="bg-transparent truncate"
          placeholder="Search product"
          search={(keyword) =>
            searchProducts({ keyword, limit: 10, page: 1, sortBy: "name" }).unwrap()
          }
          getItems={(result) => result.items}
          getOptionKey={(item) => item.id}
          getOptionLabel={(item) => `${item.basicInfo.name} (${item.basicInfo.code})`}
          onInputChange={(value) =>
            onChange(line.rowId, {
              productId: null,
              productNameSnapshot: value,
              unitId: null,
              unitName: "",
            })
          }
          onSelect={async (item: ProductListItem | null) => {
            if (!item) return;
            try {
              const product = await getProductById(item.id).unwrap();
              onChange(line.rowId, {
                productId: product.id,
                productNameSnapshot: product.basicInfo.name,
                hsnCode: product.stockAndMeasurement.hsn ?? "",
                unitId: product.stockAndMeasurement.salesUomId ?? product.stockAndMeasurement.purchaseUomId,
                unitName: product.stockAndMeasurement.salesUomName ?? product.stockAndMeasurement.purchaseUomName,
                rate: `${product.pricingAndRates.salesRate ?? product.pricingAndRates.normalRate ?? 0}`,
              });
            } catch {
              // Keep typed label if hydration fails.
            }
          }}
          onNoMatchClick={(keyword) => {
            openProductQuickAdd(keyword, (product) => {
              onChange(line.rowId, {
                productId: product.id,
                productNameSnapshot: product.basicInfo.name,
                hsnCode: product.stockAndMeasurement.hsn ?? "",
                unitId: product.stockAndMeasurement.salesUomId ?? product.stockAndMeasurement.purchaseUomId,
                unitName: product.stockAndMeasurement.salesUomName ?? product.stockAndMeasurement.purchaseUomName,
                rate: `${product.pricingAndRates.salesRate ?? product.pricingAndRates.normalRate ?? 0}`,
              });
            });
          }}
        />
      ),
      hsnCode: ({ line, onChange }) => (
        <input
          className={inputClass}
          value={line.hsnCode}
          onChange={(event) => onChange(line.rowId, { hsnCode: event.target.value })}
          placeholder="HSN code"
        />
      ),
      warehouseId: ({ line, onChange, warehouses }) => (
        <AutocompleteSelect
          value={
            warehouses.find((w) => w.id === line.warehouseId)?.name ??
            line.warehouseName
          }
          className="bg-transparent text-xs"
          placeholder="Search warehouse"
          search={async (keyword) => {
            const kw = keyword.trim().toLowerCase();
            return warehouses
              .filter((w) =>
                [w.name, w.code, w.contactPerson ?? ""].some((v) =>
                  v.toLowerCase().includes(kw),
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
            onChange(line.rowId, { warehouseId: null, warehouseName: value })
          }
          onSelect={(item) =>
            onChange(line.rowId, {
              warehouseId: item?.id ?? null,
              warehouseName: item?.name ?? "",
            })
          }
        />
      ),
      unitId: ({ line, onChange, uoms }) => (
        <select
          className={inputClass}
          value={line.unitId ?? ""}
          onChange={(event) => {
            const selected = uoms.find((u) => u.id === event.target.value);
            onChange(line.rowId, {
              unitId: selected?.id ?? null,
              unitName: selected?.name ?? "",
            });
          }}
        >
          <option value="">Unit</option>
          {uoms.map((uom) => (
            <option key={uom.id} value={uom.id}>
              {uom.name}
            </option>
          ))}
        </select>
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
      quantity: ({ line, onChange }) => (
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          value={line.quantity}
          onChange={(event) => onChange(line.rowId, { quantity: event.target.value })}
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
      total: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-sm font-semibold text-gray-800 dark:text-white/90">
          {formatReadonlyValue(line.total)}
        </div>
      ),
      remark: ({ line, onChange }) => (
        <input
          className={inputClass}
          value={line.remark}
          onChange={(event) => onChange(line.rowId, { remark: event.target.value })}
        />
      ),
    };

    return DELIVERY_NOTE_LINE_COLUMNS.map((column) => ({
      ...column,
      sortable: true,
      getSortValue: sortAccessors[column.key],
      renderCell: renderers[column.key],
    }));
  }, [getProductById, searchProducts]);
}
