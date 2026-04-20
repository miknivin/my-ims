import { GoodsReceiptLineState } from "./types/types";

export type GoodsReceiptLineColumnKey =
  | "code"
  | "productNameSnapshot"
  | "ubc"
  | "warehouseId"
  | "unitId"
  | "fRate"
  | "rate"
  | "quantity"
  | "focQuantity"
  | "grossAmount"
  | "discountPercent"
  | "discountAmount"
  | "total"
  | "manufacturingDateUtc"
  | "expiryDateUtc"
  | "remark"
  | "sellingRate";

export type GoodsReceiptLineColumnNature =
  | "input"
  | "readonly"
  | "lookup"
  | "select";

export interface GoodsReceiptLineColumnMeta {
  key: GoodsReceiptLineColumnKey;
  label: string;
  nature: GoodsReceiptLineColumnNature;
  defaultSelected: boolean;
  defaultWidth: number;
  minWidth: number;
  align?: "left" | "right" | "center";
}

export const GOODS_RECEIPT_LINE_COLUMNS: GoodsReceiptLineColumnMeta[] = [
  { key: "code", label: "Code", nature: "readonly", defaultSelected: true, defaultWidth: 110, minWidth: 90 },
  { key: "productNameSnapshot", label: "Product", nature: "lookup", defaultSelected: true, defaultWidth: 260, minWidth: 180 },
  { key: "ubc", label: "UBC", nature: "input", defaultSelected: false, defaultWidth: 140, minWidth: 100 },
  { key: "warehouseId", label: "Warehouse", nature: "lookup", defaultSelected: true, defaultWidth: 160, minWidth: 130 },
  { key: "unitId", label: "Unit", nature: "select", defaultSelected: true, defaultWidth: 120, minWidth: 90 },
  { key: "fRate", label: "F Rate", nature: "input", defaultSelected: false, defaultWidth: 110, minWidth: 90, align: "right" },
  { key: "rate", label: "Rate", nature: "input", defaultSelected: true, defaultWidth: 110, minWidth: 90, align: "right" },
  { key: "quantity", label: "Qty", nature: "input", defaultSelected: true, defaultWidth: 90, minWidth: 80, align: "right" },
  { key: "focQuantity", label: "FOC", nature: "input", defaultSelected: true, defaultWidth: 90, minWidth: 80, align: "right" },
  { key: "grossAmount", label: "Gross", nature: "readonly", defaultSelected: true, defaultWidth: 110, minWidth: 90, align: "right" },
  { key: "discountPercent", label: "Disc %", nature: "input", defaultSelected: true, defaultWidth: 100, minWidth: 90, align: "right" },
  { key: "discountAmount", label: "Disc Amt", nature: "readonly", defaultSelected: true, defaultWidth: 120, minWidth: 100, align: "right" },
  { key: "total", label: "Total", nature: "readonly", defaultSelected: true, defaultWidth: 120, minWidth: 100, align: "right" },
  { key: "manufacturingDateUtc", label: "Mfg Date", nature: "input", defaultSelected: false, defaultWidth: 130, minWidth: 120 },
  { key: "expiryDateUtc", label: "Exp Date", nature: "input", defaultSelected: false, defaultWidth: 130, minWidth: 120 },
  { key: "remark", label: "Remark", nature: "input", defaultSelected: true, defaultWidth: 180, minWidth: 140 },
  { key: "sellingRate", label: "S Rate", nature: "input", defaultSelected: true, defaultWidth: 110, minWidth: 90, align: "right" },
];

export const DEFAULT_GOODS_RECEIPT_LINE_COLUMN_KEYS =
  GOODS_RECEIPT_LINE_COLUMNS.filter((column) => column.defaultSelected).map(
    (column) => column.key,
  );

export function createDefaultGoodsReceiptLineColumnWidths() {
  return Object.fromEntries(
    GOODS_RECEIPT_LINE_COLUMNS.map((column) => [column.key, column.defaultWidth]),
  ) as Record<GoodsReceiptLineColumnKey, number>;
}

export function formatReadonlyGoodsReceiptValue(
  line: GoodsReceiptLineState,
  key: GoodsReceiptLineColumnKey,
) {
  const value = line[key];

  if (typeof value === "number") {
    return value.toFixed(2);
  }

  return value ?? "";
}
