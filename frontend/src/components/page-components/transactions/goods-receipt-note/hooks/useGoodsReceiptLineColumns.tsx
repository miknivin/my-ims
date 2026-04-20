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
import { TransactionLineColumnDefinition } from "../../shared/transactionLineItems";
import {
  GOODS_RECEIPT_LINE_COLUMNS,
  GoodsReceiptLineColumnKey,
  GoodsReceiptLineColumnMeta,
} from "../lineItemColumns";
import { GoodsReceiptLineState } from "../types/types";

export interface GoodsReceiptLineColumnRenderContext {
  line: GoodsReceiptLineState;
  uoms: Uom[];
  warehouses: Warehouse[];
  onChange: (rowId: string, patch: Partial<GoodsReceiptLineState>) => void;
}

export interface GoodsReceiptLineColumnDefinition
  extends TransactionLineColumnDefinition<
      GoodsReceiptLineState,
      GoodsReceiptLineColumnRenderContext,
      GoodsReceiptLineColumnKey
    >,
    GoodsReceiptLineColumnMeta {
  sortable: boolean;
  getSortValue: (line: GoodsReceiptLineState) => string | number;
  renderCell: (context: GoodsReceiptLineColumnRenderContext) => ReactNode;
}

const inputClass =
  "h-10 w-full truncate rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

function formatReadonlyValue(value: string | number | null) {
  if (typeof value === "number") {
    return value.toFixed(2);
  }

  return value ?? "";
}

function getProductSellingRate(product: Product) {
  return (
    product.pricingAndRates.salesRate ??
    product.pricingAndRates.normalRate ??
    product.pricingAndRates.purchaseRate ??
    0
  );
}

export function useGoodsReceiptLineColumns() {
  const [searchProducts] = useLazyGetProductsQuery();
  const [getProductById] = useLazyGetProductByIdQuery();

  return useMemo<GoodsReceiptLineColumnDefinition[]>(() => {
    const sortAccessors: Record<
      GoodsReceiptLineColumnKey,
      (line: GoodsReceiptLineState) => string | number
    > = {
      code: (line) => line.code,
      productNameSnapshot: (line) => line.productNameSnapshot,
      ubc: (line) => line.ubc,
      warehouseId: (line) => line.warehouseName,
      unitId: (line) => line.unitName,
      fRate: (line) => Number.parseFloat(line.fRate) || 0,
      rate: (line) => Number.parseFloat(line.rate) || 0,
      quantity: (line) => Number.parseFloat(line.quantity) || 0,
      focQuantity: (line) => Number.parseFloat(line.focQuantity) || 0,
      grossAmount: (line) => line.grossAmount,
      discountPercent: (line) => Number.parseFloat(line.discountPercent) || 0,
      discountAmount: (line) => line.discountAmount,
      total: (line) => line.total,
      manufacturingDateUtc: (line) => line.manufacturingDateUtc,
      expiryDateUtc: (line) => line.expiryDateUtc,
      remark: (line) => line.remark,
      sellingRate: (line) => Number.parseFloat(line.sellingRate) || 0,
    };

    const renderers: Record<
      GoodsReceiptLineColumnKey,
      GoodsReceiptLineColumnDefinition["renderCell"]
    > = {
      code: ({ line }) => (
        <div className="truncate px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.code)}
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
          getOptionLabel={(item) => `${item.basicInfo.name} (${item.basicInfo.code})`}
          onInputChange={(value) =>
            onChange(line.rowId, {
              productId: null,
              productNameSnapshot: value,
              code: "",
              ubc: "",
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
              onChange(line.rowId, {
                productId: product.id,
                productNameSnapshot: product.basicInfo.name,
                code: product.basicInfo.code,
                ubc: product.additionalDetails.barcode ?? "",
                hsnCode: product.stockAndMeasurement.hsn ?? "",
                unitId: product.stockAndMeasurement.purchaseUomId,
                unitName: product.stockAndMeasurement.purchaseUomName,
                rate: `${product.pricingAndRates.purchaseRate ?? 0}`,
                fRate: `${product.pricingAndRates.purchaseRate ?? 0}`,
                sellingRate: `${getProductSellingRate(product)}`,
              });
            } catch {
              // Keep the typed product label if detail hydration fails.
            }
          }}
        />
      ),
      ubc: ({ line, onChange }) => (
        <input
          className={inputClass}
          value={line.ubc}
          onChange={(event) => onChange(line.rowId, { ubc: event.target.value })}
        />
      ),
      warehouseId: ({ line, onChange, warehouses }) => (
        <AutocompleteSelect
          value={
            warehouses.find((warehouse) => warehouse.id === line.warehouseId)?.name ??
            line.warehouseName
          }
          className="bg-transparent text-xs"
          placeholder="Search warehouse"
          search={async (keyword) => {
            const normalizedKeyword = keyword.trim().toLowerCase();
            return warehouses
              .filter((warehouse) =>
                [warehouse.name, warehouse.code, warehouse.contactPerson ?? ""].some(
                  (value) => value.toLowerCase().includes(normalizedKeyword),
                ),
              )
              .slice(0, 10);
          }}
          getItems={(result) => result}
          getOptionKey={(item) => item.id}
          getOptionLabel={(item) => (item.code ? `${item.name} (${item.code})` : item.name)}
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
      fRate: ({ line, onChange }) => (
        <input className={inputClass} type="number" min="0" step="0.01" value={line.fRate} onChange={(event) => onChange(line.rowId, { fRate: event.target.value })} />
      ),
      rate: ({ line, onChange }) => (
        <input className={inputClass} type="number" min="0" step="0.01" value={line.rate} onChange={(event) => onChange(line.rowId, { rate: event.target.value })} />
      ),
      quantity: ({ line, onChange }) => (
        <input className={inputClass} type="number" min="0" step="0.01" value={line.quantity} onChange={(event) => onChange(line.rowId, { quantity: event.target.value })} />
      ),
      focQuantity: ({ line, onChange }) => (
        <input className={inputClass} type="number" min="0" step="0.01" value={line.focQuantity} onChange={(event) => onChange(line.rowId, { focQuantity: event.target.value })} />
      ),
      grossAmount: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.grossAmount)}
        </div>
      ),
      discountPercent: ({ line, onChange }) => (
        <input className={inputClass} type="number" min="0" step="0.01" value={line.discountPercent} onChange={(event) => onChange(line.rowId, { discountPercent: event.target.value })} />
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
      manufacturingDateUtc: ({ line, onChange }) => (
        <input className={inputClass} type="date" value={line.manufacturingDateUtc} onChange={(event) => onChange(line.rowId, { manufacturingDateUtc: event.target.value })} />
      ),
      expiryDateUtc: ({ line, onChange }) => (
        <input className={inputClass} type="date" value={line.expiryDateUtc} onChange={(event) => onChange(line.rowId, { expiryDateUtc: event.target.value })} />
      ),
      remark: ({ line, onChange }) => (
        <input className={inputClass} value={line.remark} onChange={(event) => onChange(line.rowId, { remark: event.target.value })} />
      ),
      sellingRate: ({ line, onChange }) => (
        <input className={inputClass} type="number" min="0" step="0.01" value={line.sellingRate} onChange={(event) => onChange(line.rowId, { sellingRate: event.target.value })} />
      ),
    };

    return GOODS_RECEIPT_LINE_COLUMNS.map((column) => ({
      ...column,
      sortable: true,
      getSortValue: sortAccessors[column.key],
      renderCell: renderers[column.key],
    }));
  }, [getProductById, searchProducts]);
}
