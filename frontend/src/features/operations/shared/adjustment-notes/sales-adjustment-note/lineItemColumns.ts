import { SalesAdjustmentNoteLineState } from "./types/types";

export type SalesAdjustmentNoteLineColumnKey =
  | "productCodeSnapshot"
  | "productNameSnapshot"
  | "hsnCode"
  | "unitName"
  | "quantity"
  | "rate"
  | "grossAmount"
  | "discountPercent"
  | "discountAmount"
  | "taxableAmount"
  | "taxPercent"
  | "taxAmount"
  | "warehouseId"
  | "lineTotal";

export type SalesAdjustmentNoteLineColumnNature =
  | "input"
  | "readonly"
  | "lookup"
  | "select";

export interface SalesAdjustmentNoteLineColumnMeta {
  key: SalesAdjustmentNoteLineColumnKey;
  label: string;
  nature: SalesAdjustmentNoteLineColumnNature;
  defaultSelected: boolean;
  defaultWidth: number;
  minWidth: number;
  align?: "left" | "right" | "center";
}

export const SALES_ADJUSTMENT_NOTE_LINE_COLUMNS: SalesAdjustmentNoteLineColumnMeta[] =
  [
    {
      key: "productCodeSnapshot",
      label: "Code",
      nature: "readonly",
      defaultSelected: false,
      defaultWidth: 120,
      minWidth: 90,
    },
    {
      key: "productNameSnapshot",
      label: "Product",
      nature: "readonly",
      defaultSelected: true,
      defaultWidth: 280,
      minWidth: 200,
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
      key: "rate",
      label: "Rate",
      nature: "input",
      defaultSelected: true,
      defaultWidth: 120,
      minWidth: 110,
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
      defaultSelected: true,
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
      defaultSelected: true,
      defaultWidth: 120,
      minWidth: 100,
      align: "right",
    },
    {
      key: "warehouseId",
      label: "Warehouse",
      nature: "lookup",
      defaultSelected: true,
      defaultWidth: 180,
      minWidth: 150,
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
  ];

export const DEFAULT_SALES_ADJUSTMENT_NOTE_LINE_COLUMN_KEYS =
  SALES_ADJUSTMENT_NOTE_LINE_COLUMNS.filter((column) => column.defaultSelected).map(
    (column) => column.key,
  );

export function createDefaultSalesAdjustmentNoteLineColumnWidths() {
  return Object.fromEntries(
    SALES_ADJUSTMENT_NOTE_LINE_COLUMNS.map((column) => [
      column.key,
      column.defaultWidth,
    ]),
  ) as Record<SalesAdjustmentNoteLineColumnKey, number>;
}

export function formatReadonlySalesAdjustmentLineValue(
  line: SalesAdjustmentNoteLineState,
  key: SalesAdjustmentNoteLineColumnKey,
) {
  const value = line[key];

  if (typeof value === "number") {
    return value.toFixed(2);
  }

  return value ?? "";
}
