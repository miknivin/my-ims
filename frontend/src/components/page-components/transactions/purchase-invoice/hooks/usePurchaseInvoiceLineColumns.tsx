import { ReactNode, useMemo } from "react";
import { Uom } from "../../../../../app/api/uomApi";
import { Warehouse } from "../../../../../app/api/warehouseApi";
import {
  Product,
  ProductListItem,
  useLazyGetProductByIdQuery,
  useLazyGetProductsQuery,
} from "../../../../../app/api/productApi";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import {
  PURCHASE_INVOICE_LINE_COLUMNS,
  PurchaseInvoiceLineColumnKey,
  PurchaseInvoiceLineColumnMeta,
} from "../lineItemColumns";
import { PurchaseInvoiceLineState } from "../types/types";
import { TransactionLineColumnDefinition } from "../../shared/transactionLineItems";

export interface PurchaseInvoiceLineColumnRenderContext {
  line: PurchaseInvoiceLineState;
  uoms: Uom[];
  warehouses: Warehouse[];
  onChange: (rowId: string, patch: Partial<PurchaseInvoiceLineState>) => void;
}

export interface PurchaseInvoiceLineColumnDefinition
  extends TransactionLineColumnDefinition<
      PurchaseInvoiceLineState,
      PurchaseInvoiceLineColumnRenderContext,
      PurchaseInvoiceLineColumnKey
    >,
    PurchaseInvoiceLineColumnMeta {
  sortable: boolean;
  getSortValue: (line: PurchaseInvoiceLineState) => string | number;
  renderCell: (context: PurchaseInvoiceLineColumnRenderContext) => ReactNode;
}

const inputClass =
  "h-10 w-full truncate rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

function formatReadonlyValue(value: string | number | null) {
  if (typeof value === "number") {
    return value.toFixed(2);
  }

  return value ?? "";
}

function getPurchasePricing(product: Product) {
  return {
    sellingRate:
      product.pricingAndRates.salesRate ??
      product.pricingAndRates.normalRate ??
      product.pricingAndRates.purchaseRate ??
      0,
    wholesaleRate:
      product.pricingAndRates.wholesaleRate ??
      product.pricingAndRates.salesRate ??
      product.pricingAndRates.purchaseRate ??
      0,
    mrp:
      product.pricingAndRates.mrp ??
      product.pricingAndRates.salesRate ??
      product.pricingAndRates.purchaseRate ??
      0,
  };
}

export function usePurchaseInvoiceLineColumns() {
  const [searchProducts] = useLazyGetProductsQuery();
  const [getProductById] = useLazyGetProductByIdQuery();

  return useMemo<PurchaseInvoiceLineColumnDefinition[]>(() => {
    const sortAccessors: Record<
      PurchaseInvoiceLineColumnKey,
      (line: PurchaseInvoiceLineState) => string | number
    > = {
      productCodeSnapshot: (line) => line.productCodeSnapshot,
      productNameSnapshot: (line) => line.productNameSnapshot,
      hsnCode: (line) => line.hsnCode,
      quantity: (line) => Number.parseFloat(line.quantity) || 0,
      foc: (line) => Number.parseFloat(line.foc) || 0,
      unitId: (line) => line.unitName,
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
      PurchaseInvoiceLineColumnKey,
      PurchaseInvoiceLineColumnDefinition["renderCell"]
    > = {
      productCodeSnapshot: ({ line }) => (
        <div className="truncate px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.productCodeSnapshot)}
        </div>
      ),
      productNameSnapshot: ({ line, onChange }) => (
        <AutocompleteSelect
          value={line.productNameSnapshot}
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
            onChange(line.rowId, {
              productId: null,
              productNameSnapshot: value,
              productCodeSnapshot: "",
              unitId: null,
              unitName: "",
            })
          }
          onSelect={async (item: ProductListItem | null) => {
            if (!item) {
              return;
            }

            try {
              const product = await getProductById(item.id).unwrap();
              const pricing = getPurchasePricing(product);

              onChange(line.rowId, {
                productId: product.id,
                productCodeSnapshot: product.basicInfo.code,
                productNameSnapshot: product.basicInfo.name,
                hsnCode: product.stockAndMeasurement.hsn ?? "",
                unitId: product.stockAndMeasurement.purchaseUomId,
                unitName: product.stockAndMeasurement.purchaseUomName,
                rate: `${product.pricingAndRates.purchaseRate ?? 0}`,
                sellingRate: `${pricing.sellingRate}`,
                wholesaleRate: `${pricing.wholesaleRate}`,
                mrp: `${pricing.mrp}`,
              });
            } catch {
              // Keep the typed product label if detail hydration fails.
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

    return PURCHASE_INVOICE_LINE_COLUMNS.map((column) => ({
      ...column,
      sortable: true,
      getSortValue: sortAccessors[column.key],
      renderCell: renderers[column.key],
    }));
  }, [getProductById, searchProducts]);
}
