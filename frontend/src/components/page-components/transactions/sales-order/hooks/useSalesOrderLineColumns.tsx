import { ReactNode, useMemo } from "react";
import {
  Product,
  ProductListItem,
  useLazyGetProductByIdQuery,
  useLazyGetProductsQuery,
} from "../../../../../app/api/productApi";
import { Warehouse } from "../../../../../app/api/warehouseApi";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import {
  SALES_ORDER_LINE_COLUMNS,
  SalesOrderLineColumnKey,
  SalesOrderLineColumnMeta,
} from "../lineItemColumns";
import {
  SalesOrderCommercialDetailsState,
  SalesOrderLineState,
} from "../types/types";
import { TransactionLineColumnDefinition } from "../../shared/transactionLineItems";

export interface SalesOrderLineColumnRenderContext {
  line: SalesOrderLineState;
  warehouses: Warehouse[];
  onChange: (rowId: string, patch: Partial<SalesOrderLineState>) => void;
}

export interface SalesOrderLineColumnDefinition
  extends TransactionLineColumnDefinition<
      SalesOrderLineState,
      SalesOrderLineColumnRenderContext,
      SalesOrderLineColumnKey
    >,
    SalesOrderLineColumnMeta {
  sortable: boolean;
  getSortValue: (line: SalesOrderLineState) => string | number;
  renderCell: (context: SalesOrderLineColumnRenderContext) => ReactNode;
}

const inputClass =
  "h-10 w-full truncate rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

function formatReadonlyValue(value: string | number | null) {
  if (typeof value === "number") {
    return value.toFixed(2);
  }

  return value ?? "";
}

function getProductRate(
  product: Product,
  rateLevel: SalesOrderCommercialDetailsState["rateLevel"],
) {
  if (rateLevel === "WRATE") {
    return (
      product.pricingAndRates.wholesaleRate ??
      product.pricingAndRates.salesRate ??
      0
    );
  }

  if (rateLevel === "MRATE") {
    return product.pricingAndRates.mrp ?? product.pricingAndRates.salesRate ?? 0;
  }

  return (
    product.pricingAndRates.salesRate ?? product.pricingAndRates.normalRate ?? 0
  );
}

export function useSalesOrderLineColumns(
  rateLevel: SalesOrderCommercialDetailsState["rateLevel"],
) {
  const [searchProducts] = useLazyGetProductsQuery();
  const [getProductById] = useLazyGetProductByIdQuery();

  return useMemo<SalesOrderLineColumnDefinition[]>(() => {
    const sortAccessors: Record<
      SalesOrderLineColumnKey,
      (line: SalesOrderLineState) => string | number
    > = {
      productId: (line) => line.productId ?? "",
      productName: (line) => line.productName,
      hsnCode: (line) => line.hsnCode,
      unitName: (line) => line.unitName,
      quantity: (line) => Number.parseFloat(line.quantity) || 0,
      foc: (line) => Number.parseFloat(line.foc) || 0,
      mrp: (line) => Number.parseFloat(line.mrp) || 0,
      rate: (line) => Number.parseFloat(line.rate) || 0,
      grossAmount: (line) => line.grossAmount,
      discountPercent: (line) => Number.parseFloat(line.discountPercent) || 0,
      discountAmount: (line) => line.discountAmount,
      taxableAmount: (line) => line.taxableAmount,
      taxPercent: (line) => Number.parseFloat(line.taxPercent) || 0,
      taxAmount: (line) => line.taxAmount,
      warehouseId: (line) => line.warehouseName || "",
      netAmount: (line) => line.netAmount,
    };

    const renderers: Record<
      SalesOrderLineColumnKey,
      SalesOrderLineColumnDefinition["renderCell"]
    > = {
      productId: ({ line }) => (
        <div className="truncate px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatReadonlyValue(line.productId)}
        </div>
      ),
      productName: ({ line, onChange }) => (
        <AutocompleteSelect
          value={line.productName}
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
              productName: value,
              hsnCode: "",
              unitId: null,
              unitName: "",
              rate: "0",
              mrp: "0",
            })
          }
          onSelect={async (item: ProductListItem | null) => {
            if (!item) {
              return;
            }

            try {
              const product = await getProductById(item.id).unwrap();
              const rate = getProductRate(product, rateLevel);

              onChange(line.rowId, {
                productId: product.id,
                productName: product.basicInfo.name,
                hsnCode: product.stockAndMeasurement.hsn ?? "",
                unitId: product.stockAndMeasurement.salesUomId,
                unitName: product.stockAndMeasurement.salesUomName,
                rate: `${rate}`,
                mrp: `${product.pricingAndRates.mrp ?? 0}`,
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
      netAmount: ({ line }) => (
        <div className="truncate px-3 py-2 text-right text-sm font-semibold text-gray-800 dark:text-white/90">
          {formatReadonlyValue(line.netAmount)}
        </div>
      ),
    };

    return SALES_ORDER_LINE_COLUMNS.map((column) => ({
      ...column,
      sortable: true,
      getSortValue: sortAccessors[column.key],
      renderCell: renderers[column.key],
    }));
  }, [getProductById, rateLevel, searchProducts]);
}
