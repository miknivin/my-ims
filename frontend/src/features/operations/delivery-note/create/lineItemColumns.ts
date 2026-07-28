import { DeliveryNoteLineState } from "./types/types";

export type DeliveryNoteLineColumnKey =
  | "productNameSnapshot"
  | "hsnCode"
  | "warehouseId"
  | "unitId"
  | "rate"
  | "quantity"
  | "grossAmount"
  | "discountPercent"
  | "discountAmount"
  | "total"
  | "remark";

export type DeliveryNoteLineColumnNature =
  | "input"
  | "readonly"
  | "lookup"
  | "select";

export interface DeliveryNoteLineColumnMeta {
  key: DeliveryNoteLineColumnKey;
  label: string;
  nature: DeliveryNoteLineColumnNature;
  defaultSelected: boolean;
  defaultWidth: number;
  minWidth: number;
  align?: "left" | "right" | "center";
}

export const DELIVERY_NOTE_LINE_COLUMNS: DeliveryNoteLineColumnMeta[] = [
  { key: "productNameSnapshot", label: "Product", nature: "lookup", defaultSelected: true, defaultWidth: 260, minWidth: 180 },
  { key: "hsnCode", label: "HSN", nature: "input", defaultSelected: false, defaultWidth: 110, minWidth: 90 },
  { key: "warehouseId", label: "Warehouse", nature: "lookup", defaultSelected: true, defaultWidth: 160, minWidth: 130 },
  { key: "unitId", label: "Unit", nature: "select", defaultSelected: true, defaultWidth: 120, minWidth: 90 },
  { key: "rate", label: "Rate", nature: "input", defaultSelected: true, defaultWidth: 110, minWidth: 90, align: "right" },
  { key: "quantity", label: "Qty", nature: "input", defaultSelected: true, defaultWidth: 90, minWidth: 80, align: "right" },
  { key: "grossAmount", label: "Gross", nature: "readonly", defaultSelected: false, defaultWidth: 110, minWidth: 90, align: "right" },
  { key: "discountPercent", label: "Disc %", nature: "input", defaultSelected: true, defaultWidth: 100, minWidth: 90, align: "right" },
  { key: "discountAmount", label: "Disc Amt", nature: "readonly", defaultSelected: false, defaultWidth: 120, minWidth: 100, align: "right" },
  { key: "total", label: "Total", nature: "readonly", defaultSelected: true, defaultWidth: 120, minWidth: 100, align: "right" },
  { key: "remark", label: "Remark", nature: "input", defaultSelected: true, defaultWidth: 180, minWidth: 140 },
];

export const DEFAULT_DELIVERY_NOTE_LINE_COLUMN_KEYS =
  DELIVERY_NOTE_LINE_COLUMNS.filter((column) => column.defaultSelected).map(
    (column) => column.key,
  );

export function createDefaultDeliveryNoteLineColumnWidths() {
  return Object.fromEntries(
    DELIVERY_NOTE_LINE_COLUMNS.map((column) => [column.key, column.defaultWidth]),
  ) as Record<DeliveryNoteLineColumnKey, number>;
}

export function formatReadonlyDeliveryNoteValue(
  line: DeliveryNoteLineState,
  key: DeliveryNoteLineColumnKey,
) {
  const value = line[key as keyof DeliveryNoteLineState];
  if (typeof value === "number") return value.toFixed(2);
  return value ?? "";
}
