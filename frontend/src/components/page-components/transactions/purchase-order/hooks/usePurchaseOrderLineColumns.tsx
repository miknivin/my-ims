import { ReactNode, useMemo } from "react";
import { Uom } from "../../../../../app/api/uomApi";
import { PurchaseOrderLineState } from "../types/types";
import { Warehouse } from "../../../../../app/api/warehouseApi";
import { PURCHASE_ORDER_LINE_COLUMNS, PurchaseOrderLineColumnKey, PurchaseOrderLineColumnMeta } from "../lineItemColumns";
import { Product, ProductListItem, useLazyGetProductByIdQuery, useLazyGetProductsQuery } from "../../../../../app/api/productApi";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import { TransactionLineColumnDefinition } from "../../shared/transactionLineItems";




export interface PurchaseOrderLineColumnRenderContext {
  line: PurchaseOrderLineState;
  taxable: boolean;
  uoms: Uom[];
  warehouses: Warehouse[];
  onChange: (rowId: string, patch: Partial<PurchaseOrderLineState>) => void;
}

export interface PurchaseOrderLineColumnDefinition
  extends TransactionLineColumnDefinition<
      PurchaseOrderLineState,
      PurchaseOrderLineColumnRenderContext,
      PurchaseOrderLineColumnKey
    >,
    PurchaseOrderLineColumnMeta {
  sortable: boolean;
  getSortValue: (line: PurchaseOrderLineState) => string | number;
  renderCell: (context: PurchaseOrderLineColumnRenderContext) => ReactNode;
}

const inputClass =
  "h-10 w-full truncate rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

function formatReadonlyValue(value: string | number | null) {
  if (typeof value === "number") {
    return value.toFixed(2);
  }

  return value ?? "";
}

export function usePurchaseOrderLineColumns() {
  const [searchProducts] = useLazyGetProductsQuery();
  const [getProductById] = useLazyGetProductByIdQuery();

  return useMemo<PurchaseOrderLineColumnDefinition[]>(() => {
    const sortAccessors: Record<
      PurchaseOrderLineColumnKey,
      (line: PurchaseOrderLineState) => string | number
    > = {
      id: (line) => line.id,
      poId: (line) => line.poId ?? "",
      itemId: (line) => line.itemId ?? "",
      itemNameSnapshot: (line) => line.itemNameSnapshot,
      hsnCode: (line) => line.hsnCode,
      quantity: (line) => Number.parseFloat(line.quantity) || 0,
      unitId: (line) => line.unitName || "",
      rate: (line) => Number.parseFloat(line.rate) || 0,
      grossAmount: (line) => line.grossAmount,
      discountType: (line) => line.discountType,
      discountValue: (line) => Number.parseFloat(line.discountValue) || 0,
      discountAmount: (line) => line.discountAmount,
      taxableAmount: (line) => line.taxableAmount,
      cgstRate: (line) => Number.parseFloat(line.cgstRate) || 0,
      cgstAmount: (line) => line.cgstAmount,
      sgstRate: (line) => Number.parseFloat(line.sgstRate) || 0,
      sgstAmount: (line) => line.sgstAmount,
      igstRate: (line) => Number.parseFloat(line.igstRate) || 0,
      igstAmount: (line) => line.igstAmount,
      lineTotal: (line) => line.lineTotal,
      warehouseId: (line) => line.warehouseId ?? "",
      receivedQty: (line) => line.receivedQty,
    };

    const renderers: Record<
      PurchaseOrderLineColumnKey,
      PurchaseOrderLineColumnDefinition["renderCell"]
    > = {
      id: ({ line }) => (
        <div className="truncate px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.id)}
        </div>
      ),
      poId: ({ line }) => (
        <div className="truncate px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.poId)}
        </div>
      ),
      itemId: ({ line }) => (
        <div className="truncate px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.itemId)}
        </div>
      ),
      itemNameSnapshot: ({ line, onChange }) => (
        <AutocompleteSelect
          value={line.itemNameSnapshot}
          className="bg-transparent truncate"
          placeholder="Search product"
          search={(keyword) =>
            searchProducts({
              keyword,
              limit: 10,
              page: 1,
              sortBy: "name",
            }).unwrap()
          }
          getItems={(result) => result.items}
          getOptionKey={(item) => item.id}
          getOptionLabel={(item) =>
            `${item.basicInfo.name} (${item.basicInfo.code})`
          }
          onInputChange={(value) =>
            onChange(line.rowId, { itemNameSnapshot: value, itemId: null })
          }
          onSelect={async (item: ProductListItem | null) => {
            if (!item) {
              return;
            }

            onChange(line.rowId, {
              itemId: item.id,
              itemNameSnapshot: item.basicInfo.name,
              hsnCode: item.stockAndMeasurement.hsn ?? "",
              unitId: item.stockAndMeasurement.baseUomId,
              unitName: item.stockAndMeasurement.baseUomName,
            });

            try {
              const product: Product = await getProductById(item.id).unwrap();
              onChange(line.rowId, {
                itemId: product.id,
                itemNameSnapshot: product.basicInfo.name,
                hsnCode: product.stockAndMeasurement.hsn ?? "",
                rate: String(product.pricingAndRates.purchaseRate ?? 0),
                unitId: product.stockAndMeasurement.baseUomId,
                unitName: product.stockAndMeasurement.baseUomName,
              });
            } catch {
              // Keep partial hydration when detail fetch fails.
            }
          }}
        />
      ),
      hsnCode: ({ line, onChange }) => (
        <input
          className={inputClass}
          value={line.hsnCode}
          onChange={(event) =>
            onChange(line.rowId, { hsnCode: event.target.value })
          }
        />
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
      unitId: ({ line, onChange, uoms }) => (
        <select
          className={inputClass}
          value={line.unitId ?? ""}
          onChange={(event) => {
            const selected = uoms.find((uom) => uom.id === event.target.value);
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
          onChange={(event) =>
            onChange(line.rowId, { rate: event.target.value })
          }
        />
      ),
      grossAmount: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.grossAmount)}
        </div>
      ),
      discountType: ({ line, onChange }) => (
        <select
          className={inputClass}
          value={line.discountType}
          onChange={(event) =>
            onChange(line.rowId, {
              discountType: event.target
                .value as PurchaseOrderLineState["discountType"],
            })
          }
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed</option>
        </select>
      ),
      discountValue: ({ line, onChange }) => (
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          value={line.discountValue}
          onChange={(event) =>
            onChange(line.rowId, { discountValue: event.target.value })
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
      cgstRate: ({ line, onChange, taxable }) => (
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          value={line.cgstRate}
          onChange={(event) =>
            onChange(line.rowId, { cgstRate: event.target.value })
          }
          disabled={!taxable}
        />
      ),
      cgstAmount: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.cgstAmount)}
        </div>
      ),
      sgstRate: ({ line, onChange, taxable }) => (
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          value={line.sgstRate}
          onChange={(event) =>
            onChange(line.rowId, { sgstRate: event.target.value })
          }
          disabled={!taxable}
        />
      ),
      sgstAmount: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.sgstAmount)}
        </div>
      ),
      igstRate: ({ line, onChange, taxable }) => (
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          value={line.igstRate}
          onChange={(event) =>
            onChange(line.rowId, { igstRate: event.target.value })
          }
          disabled={!taxable}
        />
      ),
      igstAmount: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.igstAmount)}
        </div>
      ),
      lineTotal: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-sm font-semibold text-gray-800 dark:text-white/90">
          {formatReadonlyValue(line.lineTotal)}
        </div>
      ),
      warehouseId: ({ line, onChange, warehouses }) => (
        <AutocompleteSelect
          value={
            warehouses.find((warehouse) => warehouse.id === line.warehouseId)
              ?.name ?? ""
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
          onInputChange={() => onChange(line.rowId, { warehouseId: null })}
          onSelect={(item) =>
            onChange(line.rowId, { warehouseId: item?.id ?? null })
          }
        />
      ),
      receivedQty: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.receivedQty)}
        </div>
      ),
    };

    return PURCHASE_ORDER_LINE_COLUMNS.map((column) => ({
      ...column,
      sortable: true,
      getSortValue: sortAccessors[column.key],
      renderCell: renderers[column.key],
    }));
  }, [getProductById, searchProducts]);
}
