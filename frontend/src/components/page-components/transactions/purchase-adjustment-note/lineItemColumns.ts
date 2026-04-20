import { PurchaseAdjustmentNoteLineState } from "./types/types";

export type PurchaseAdjustmentNoteLineColumnKey =
  | "productCodeSnapshot"
  | "productNameSnapshot"
  | "hsnCode"
  | "quantity"
  | "foc"
  | "unitName"
  | "rate"
  | "grossAmount"
  | "discountPercent"
  | "discountAmount"
  | "taxableAmount"
  | "taxPercent"
  | "taxAmount"
  | "cost"
  | "sellingRate"
  | "profitPercent"
  | "profitAmount"
  | "wholesaleRate"
  | "mrp"
  | "warehouseId"
  | "lineTotal";

export type PurchaseAdjustmentNoteLineColumnNature =
  | "input"
  | "readonly"
  | "lookup"
  | "select";

export interface PurchaseAdjustmentNoteLineColumnMeta {
  key: PurchaseAdjustmentNoteLineColumnKey;
  label: string;
  nature: PurchaseAdjustmentNoteLineColumnNature;
  defaultSelected: boolean;
  defaultWidth: number;
  minWidth: number;
  align?: "left" | "right" | "center";
}

export const PURCHASE_ADJUSTMENT_NOTE_LINE_COLUMNS: PurchaseAdjustmentNoteLineColumnMeta[] =
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
      key: "unitName",
      label: "Unit",
      nature: "readonly",
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
      key: "cost",
      label: "Cost",
      nature: "readonly",
      defaultSelected: true,
      defaultWidth: 110,
      minWidth: 100,
      align: "right",
    },
    {
      key: "sellingRate",
      label: "S Rate",
      nature: "input",
      defaultSelected: true,
      defaultWidth: 110,
      minWidth: 100,
      align: "right",
    },
    {
      key: "profitPercent",
      label: "Profit %",
      nature: "readonly",
      defaultSelected: false,
      defaultWidth: 110,
      minWidth: 100,
      align: "right",
    },
    {
      key: "profitAmount",
      label: "Profit Amt",
      nature: "readonly",
      defaultSelected: false,
      defaultWidth: 120,
      minWidth: 100,
      align: "right",
    },
    {
      key: "wholesaleRate",
      label: "W Rate",
      nature: "input",
      defaultSelected: true,
      defaultWidth: 110,
      minWidth: 100,
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
      key: "warehouseId",
      label: "Warehouse",
      nature: "lookup",
      defaultSelected: true,
      defaultWidth: 150,
      minWidth: 130,
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

export const DEFAULT_PURCHASE_ADJUSTMENT_NOTE_LINE_COLUMN_KEYS =
  PURCHASE_ADJUSTMENT_NOTE_LINE_COLUMNS.filter((column) => column.defaultSelected).map(
    (column) => column.key,
  );

export function createDefaultPurchaseAdjustmentLineColumnWidths() {
  return Object.fromEntries(
    PURCHASE_ADJUSTMENT_NOTE_LINE_COLUMNS.map((column) => [
      column.key,
      column.defaultWidth,
    ]),
  ) as Record<PurchaseAdjustmentNoteLineColumnKey, number>;
}

export function formatReadonlyPurchaseAdjustmentLineValue(
  line: PurchaseAdjustmentNoteLineState,
  key: PurchaseAdjustmentNoteLineColumnKey,
) {
  const value = line[key];

  if (typeof value === "number") {
    return value.toFixed(2);
  }

  return value ?? "";
}
