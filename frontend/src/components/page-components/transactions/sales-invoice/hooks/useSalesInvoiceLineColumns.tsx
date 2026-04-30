import { ReactNode, useMemo } from "react";
import {
  Product,
  ProductListItem,
  useLazyGetProductByIdQuery,
  useLazyGetProductsQuery,
} from "../../../../../app/api/productApi";
import { useLazyGetWarehousesQuery } from "../../../../../app/api/warehouseApi";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import { TransactionLineColumnDefinition } from "../../shared/transactionLineItems";
import {
  SALES_INVOICE_LINE_COLUMNS,
  SalesInvoiceLineColumnKey,
  SalesInvoiceLineColumnMeta,
} from "../lineItemColumns";
import { SalesInvoiceLineState } from "../types/types";

export interface SalesInvoiceLineColumnRenderContext {
  line: SalesInvoiceLineState;
  onChange: (rowId: string, patch: Partial<SalesInvoiceLineState>) => void;
}

export interface SalesInvoiceLineColumnDefinition
  extends TransactionLineColumnDefinition<
      SalesInvoiceLineState,
      SalesInvoiceLineColumnRenderContext,
      SalesInvoiceLineColumnKey
    >,
    SalesInvoiceLineColumnMeta {
  sortable: boolean;
  getSortValue: (line: SalesInvoiceLineState) => string | number;
  renderCell: (context: SalesInvoiceLineColumnRenderContext) => ReactNode;
}

const inputClass =
  "h-10 w-full truncate rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

function formatReadonlyValue(value: string | number | null) {
  if (typeof value === "number") {
    return value.toFixed(2);
  }

  return value ?? "";
}

function getDefaultSalesRate(product: Product) {
  return (
    product.pricingAndRates.salesRate ??
    product.pricingAndRates.normalRate ??
    product.pricingAndRates.purchaseRate ??
    0
  );
}

function getDefaultCostRate(product: Product) {
  return (
    product.pricingAndRates.cost ?? product.pricingAndRates.purchaseRate ?? 0
  );
}

export function useSalesInvoiceLineColumns() {
  const [searchProducts] = useLazyGetProductsQuery();
  const [getProductById] = useLazyGetProductByIdQuery();
  const [searchWarehouses] = useLazyGetWarehousesQuery();

  return useMemo<SalesInvoiceLineColumnDefinition[]>(() => {
    const sortAccessors: Record<
      SalesInvoiceLineColumnKey,
      (line: SalesInvoiceLineState) => string | number
    > = {
      productCodeSnapshot: (line) => line.productCodeSnapshot,
      productNameSnapshot: (line) => line.productNameSnapshot,
      hsnCode: (line) => line.hsnCode,
      unitName: (line) => line.unitName,
      quantity: (line) => Number.parseFloat(line.quantity) || 0,
      rate: (line) => Number.parseFloat(line.rate) || 0,
      grossAmount: (line) => line.grossAmount,
      discountPercent: (line) => Number.parseFloat(line.discountPercent) || 0,
      discountAmount: (line) => line.discountAmount,
      taxableAmount: (line) => line.taxableAmount,
      taxPercent: (line) => Number.parseFloat(line.taxPercent) || 0,
      taxAmount: (line) => line.taxAmount,
      costRate: (line) => line.costRate,
      cogsAmount: (line) => line.cogsAmount,
      grossProfitAmount: (line) => line.grossProfitAmount,
      warehouseId: (line) => line.warehouseName,
      lineTotal: (line) => line.lineTotal,
    };

    const renderers: Record<
      SalesInvoiceLineColumnKey,
      SalesInvoiceLineColumnDefinition["renderCell"]
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
              productCodeSnapshot: "",
              productNameSnapshot: value,
              hsnCode: "",
              unitId: null,
              unitName: "",
              rate: "0",
              costRate: 0,
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
                productCodeSnapshot: product.basicInfo.code,
                productNameSnapshot: product.basicInfo.name,
                hsnCode: product.stockAndMeasurement.hsn ?? "",
                unitId: product.stockAndMeasurement.salesUomId,
                unitName: product.stockAndMeasurement.salesUomName,
                rate: `${getDefaultSalesRate(product)}`,
                costRate: getDefaultCostRate(product),
              });
            } catch {
              // Keep the typed product label if detail hydration fails.
            }
          }}
        />
      ),
      hsnCode: ({ line }) => (
        <div className="truncate px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.hsnCode)}
        </div>
      ),
      unitName: ({ line }) => (
        <div className="truncate px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.unitName)}
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
      costRate: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.costRate)}
        </div>
      ),
      cogsAmount: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.cogsAmount)}
        </div>
      ),
      grossProfitAmount: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.grossProfitAmount)}
        </div>
      ),
      warehouseId: ({ line, onChange }) => (
        <AutocompleteSelect
          value={line.warehouseName}
          className="bg-transparent text-xs"
          placeholder="Search warehouse"
          search={(keyword) => searchWarehouses({ keyword, limit: 10 }).unwrap()}
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

    return SALES_INVOICE_LINE_COLUMNS.map((column) => ({
      ...column,
      sortable: true,
      getSortValue: sortAccessors[column.key],
      renderCell: renderers[column.key],
    }));
  }, [getProductById, searchProducts, searchWarehouses]);
}
