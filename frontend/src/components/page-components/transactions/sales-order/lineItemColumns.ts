import { SalesOrderLineState } from "./types/types";

export type SalesOrderLineColumnKey =
  | "productId"
  | "productName"
  | "hsnCode"
  | "unitName"
  | "quantity"
  | "foc"
  | "mrp"
  | "rate"
  | "grossAmount"
  | "discountPercent"
  | "discountAmount"
  | "taxableAmount"
  | "taxPercent"
  | "taxAmount"
  | "warehouseId"
  | "netAmount";

export type SalesOrderLineColumnNature =
  | "input"
  | "readonly"
  | "lookup"
  | "select";

export interface SalesOrderLineColumnMeta {
  key: SalesOrderLineColumnKey;
  label: string;
  nature: SalesOrderLineColumnNature;
  defaultSelected: boolean;
  defaultWidth: number;
  minWidth: number;
  align?: "left" | "right" | "center";
}

export const SALES_ORDER_LINE_COLUMNS: SalesOrderLineColumnMeta[] = [
  {
    key: "productId",
    label: "Product Id",
    nature: "readonly",
    defaultSelected: false,
    defaultWidth: 120,
    minWidth: 100,
  },
  {
    key: "productName",
    label: "Product",
    nature: "lookup",
    defaultSelected: true,
    defaultWidth: 280,
    minWidth: 180,
  },
  {
    key: "hsnCode",
    label: "HSN",
    nature: "readonly",
    defaultSelected: true,
    defaultWidth: 120,
    minWidth: 100,
  },
  {
    key: "unitName",
    label: "Unit",
    nature: "readonly",
    defaultSelected: true,
    defaultWidth: 120,
    minWidth: 100,
  },
  {
    key: "quantity",
    label: "Qty",
    nature: "input",
    defaultSelected: true,
    defaultWidth: 90,
    minWidth: 80,
    align: "right",
  },
  {
    key: "foc",
    label: "FOC",
    nature: "input",
    defaultSelected: true,
    defaultWidth: 90,
    minWidth: 80,
    align: "right",
  },
  {
    key: "mrp",
    label: "MRP",
    nature: "input",
    defaultSelected: true,
    defaultWidth: 110,
    minWidth: 100,
    align: "right",
  },
  {
    key: "rate",
    label: "Rate",
    nature: "input",
    defaultSelected: true,
    defaultWidth: 110,
    minWidth: 100,
    align: "right",
  },
  {
    key: "grossAmount",
    label: "Gross",
    nature: "readonly",
    defaultSelected: true,
    defaultWidth: 120,
    minWidth: 100,
    align: "right",
  },
  {
    key: "discountPercent",
    label: "Disc %",
    nature: "input",
    defaultSelected: true,
    defaultWidth: 100,
    minWidth: 90,
    align: "right",
  },
  {
    key: "discountAmount",
    label: "Disc Amt",
    nature: "readonly",
    defaultSelected: true,
    defaultWidth: 120,
    minWidth: 100,
    align: "right",
  },
  {
    key: "taxableAmount",
    label: "Taxable",
    nature: "readonly",
    defaultSelected: false,
    defaultWidth: 120,
    minWidth: 100,
    align: "right",
  },
  {
    key: "taxPercent",
    label: "Tax %",
    nature: "input",
    defaultSelected: true,
    defaultWidth: 100,
    minWidth: 90,
    align: "right",
  },
  {
    key: "taxAmount",
    label: "Tax Amt",
    nature: "readonly",
    defaultSelected: false,
    defaultWidth: 120,
    minWidth: 100,
    align: "right",
  },
  {
    key: "warehouseId",
    label: "Warehouse",
    nature: "select",
    defaultSelected: true,
    defaultWidth: 180,
    minWidth: 150,
  },
  {
    key: "netAmount",
    label: "Net",
    nature: "readonly",
    defaultSelected: true,
    defaultWidth: 120,
    minWidth: 100,
    align: "right",
  },
];

export const DEFAULT_SALES_ORDER_LINE_COLUMN_KEYS =
  SALES_ORDER_LINE_COLUMNS.filter((column) => column.defaultSelected).map(
    (column) => column.key,
  );

export function createDefaultSalesOrderLineColumnWidths() {
  return Object.fromEntries(
    SALES_ORDER_LINE_COLUMNS.map((column) => [column.key, column.defaultWidth]),
  ) as Record<SalesOrderLineColumnKey, number>;
}

export function formatReadonlyLineValue(
  line: SalesOrderLineState,
  key: SalesOrderLineColumnKey,
) {
  const value = line[key];

  if (typeof value === "number") {
    return value.toFixed(2);
  }

  return value ?? "";
}
