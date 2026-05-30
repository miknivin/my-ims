import { PurchaseOrderLineState } from "./types/types";

export type PurchaseOrderLineColumnKey =
  | "id"
  | "poId"
  | "itemId"
  | "itemNameSnapshot"
  | "hsnCode"
  | "quantity"
  | "unitId"
  | "rate"
  | "grossAmount"
  | "discountType"
  | "discountValue"
  | "discountAmount"
  | "taxableAmount"
  | "cgstRate"
  | "cgstAmount"
  | "sgstRate"
  | "sgstAmount"
  | "igstRate"
  | "igstAmount"
  | "lineTotal"
  | "warehouseId"
  | "receivedQty";

export type PurchaseOrderLineColumnNature =
  | "input"
  | "readonly"
  | "lookup"
  | "select";

export interface PurchaseOrderLineColumnMeta {
  key: PurchaseOrderLineColumnKey;
  label: string;
  nature: PurchaseOrderLineColumnNature;
  defaultSelected: boolean;
  defaultWidth: number;
  minWidth: number;
  align?: "left" | "right" | "center";
}

export const PURCHASE_ORDER_LINE_COLUMNS: PurchaseOrderLineColumnMeta[] = [
  {
    key: "id",
    label: "Id",
    nature: "readonly",
    defaultSelected: false,
    defaultWidth: 90,
    minWidth: 70,
  },
  {
    key: "poId",
    label: "PO Id",
    nature: "readonly",
    defaultSelected: false,
    defaultWidth: 110,
    minWidth: 90,
  },
  {
    key: "itemId",
    label: "Item Id",
    nature: "readonly",
    defaultSelected: false,
    defaultWidth: 120,
    minWidth: 100,
  },
  {
    key: "itemNameSnapshot",
    label: "Item",
    nature: "lookup",
    defaultSelected: true,
    defaultWidth: 280,
    minWidth: 100,
  },
  {
    key: "hsnCode",
    label: "HSN",
    nature: "input",
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
    key: "unitId",
    label: "Unit",
    nature: "select",
    defaultSelected: true,
    defaultWidth: 120,
    minWidth: 100,
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
    key: "discountType",
    label: "Disc Type",
    nature: "select",
    defaultSelected: true,
    defaultWidth: 120,
    minWidth: 110,
  },
  {
    key: "discountValue",
    label: "Disc Value",
    nature: "input",
    defaultSelected: true,
    defaultWidth: 120,
    minWidth: 100,
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
    defaultSelected: true,
    defaultWidth: 120,
    minWidth: 100,
    align: "right",
  },
  {
    key: "cgstRate",
    label: "CGST %",
    nature: "input",
    defaultSelected: false,
    defaultWidth: 100,
    minWidth: 90,
    align: "right",
  },
  {
    key: "cgstAmount",
    label: "CGST Amt",
    nature: "readonly",
    defaultSelected: false,
    defaultWidth: 120,
    minWidth: 100,
    align: "right",
  },
  {
    key: "sgstRate",
    label: "SGST %",
    nature: "input",
    defaultSelected: false,
    defaultWidth: 100,
    minWidth: 90,
    align: "right",
  },
  {
    key: "sgstAmount",
    label: "SGST Amt",
    nature: "readonly",
    defaultSelected: false,
    defaultWidth: 120,
    minWidth: 100,
    align: "right",
  },
  {
    key: "igstRate",
    label: "IGST %",
    nature: "input",
    defaultSelected: false,
    defaultWidth: 100,
    minWidth: 90,
    align: "right",
  },
  {
    key: "igstAmount",
    label: "IGST Amt",
    nature: "readonly",
    defaultSelected: false,
    defaultWidth: 120,
    minWidth: 100,
    align: "right",
  },
  {
    key: "lineTotal",
    label: "Line Total",
    nature: "readonly",
    defaultSelected: true,
    defaultWidth: 130,
    minWidth: 110,
    align: "right",
  },
  {
    key: "warehouseId",
    label: "Warehouse",
    nature: "select",
    defaultSelected: true,
    defaultWidth: 150,
    minWidth: 130,
  },
  {
    key: "receivedQty",
    label: "Received Qty",
    nature: "readonly",
    defaultSelected: true,
    defaultWidth: 120,
    minWidth: 100,
    align: "right",
  },
];

export const DEFAULT_PURCHASE_ORDER_LINE_COLUMN_KEYS =
  PURCHASE_ORDER_LINE_COLUMNS.filter((column) => column.defaultSelected).map(
    (column) => column.key,
  );

export function createDefaultLineColumnWidths() {
  return Object.fromEntries(
    PURCHASE_ORDER_LINE_COLUMNS.map((column) => [
      column.key,
      column.defaultWidth,
    ]),
  ) as Record<PurchaseOrderLineColumnKey, number>;
}

export function getLineColumnDefinition(key: PurchaseOrderLineColumnKey) {
  return PURCHASE_ORDER_LINE_COLUMNS.find((column) => column.key === key);
}

export function formatReadonlyLineValue(
  line: PurchaseOrderLineState,
  key: PurchaseOrderLineColumnKey,
) {
  const value = line[key];

  if (typeof value === "number") {
    return value.toFixed(2);
  }

  return value ?? "";
}
