import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "@/shared/types/filtering";

// ── Stock Summary ──────────────────────────────────────────────────────────────
export interface StockSummaryFilter {
  categoryId?: string;
  warehouseId?: string;
  showZeroStock?: boolean;
}

export interface StockSummaryRow {
  itemId: string;
  itemCode: string;
  itemName: string;
  categoryId: string | null;
  categoryName: string | null;
  uom: string;
  quantity: number;
  value: number;
  averageRate: number;
}

export interface StockSummaryReport {
  totalQuantity: number;
  totalValue: number;
  rows: StockSummaryRow[];
}

// ── Stock Statement ────────────────────────────────────────────────────────────
export interface StockStatementFilter {
  fromDate: string;
  toDate: string;
  groupBy?: "category" | "warehouse";
  categoryId?: string;
  warehouseId?: string;
  showZeroStock?: boolean;
}

export interface StockStatementRow {
  itemId: string;
  itemCode: string;
  itemName: string;
  categoryName: string | null;
  warehouseName: string | null;
  uom: string;
  openingQty: number;
  openingValue: number;
  inwardQty: number;
  inwardValue: number;
  outwardQty: number;
  outwardValue: number;
  closingQty: number;
  closingValue: number;
  closingRate: number;
}

export interface StockStatementReport {
  fromDate: string;
  toDate: string;
  groupBy: string;
  totalOpeningValue: number;
  totalInwardValue: number;
  totalOutwardValue: number;
  totalClosingValue: number;
  rows: StockStatementRow[];
}

// ── Stock Summary Enhanced ─────────────────────────────────────────────────────
export interface StockSummaryEnhancedFilter {
  groupBy?: "category" | "warehouse";
  asOfDate?: string;
  categoryId?: string;
  warehouseId?: string;
  showZeroStock?: boolean;
}

export interface StockSummaryEnhancedRow {
  itemId: string;
  itemCode: string;
  itemName: string;
  categoryName: string | null;
  warehouseName: string | null;
  uom: string;
  quantity: number;
}

export interface StockSummaryEnhancedReport {
  groupBy: string;
  asOfDate: string | null;
  totalQuantity: number;
  rows: StockSummaryEnhancedRow[];
}

// ── Item-wise Stock ──────────────────────────────────────────────────────────────
export interface ItemWiseStockFilter {
  fromDate?: string;
  toDate?: string;
  itemId?: string;
  warehouseId?: string;
  categoryId?: string;
  showZeroStock?: boolean;
}

export interface ItemWiseStockRow {
  itemId: string;
  itemCode: string;
  itemName: string;
  categoryName: string | null;
  uom: string;
  openingQty: number;
  inwardQty: number;
  outwardQty: number;
  closingQty: number;
  closingRate: number;
  closingValue: number;
}

export interface ItemWiseStockReport {
  fromDate: string;
  toDate: string;
  totalClosingQty: number;
  totalClosingValue: number;
  rows: ItemWiseStockRow[];
}

// ── Stock Movement ──────────────────────────────────────────────────────────────
export interface StockMovementFilter {
  itemId: string;
  warehouseId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface StockMovementRow {
  id: string;
  postingDateUtc: string;
  movementType: string;
  sourceType: string;
  warehouseName: string | null;
  quantityChange: number;
  valuationRate: number;
  valueChange: number;
  balanceQuantity: number;
  balanceValue: number;
  remarks: string | null;
}

export interface StockMovementReport {
  itemId: string;
  itemName: string;
  fromDate: string;
  toDate: string;
  openingQuantity: number;
  openingValue: number;
  closingQuantity: number;
  closingValue: number;
  rows: StockMovementRow[];
}

// ── Inventory Valuation ──────────────────────────────────────────────────────────
export interface InventoryValuationFilter {
  groupBy?: "category" | "warehouse";
  asOfDate?: string;
  categoryId?: string;
  warehouseId?: string;
  showZeroStock?: boolean;
}

export interface InventoryValuationRow {
  itemId: string;
  itemCode: string;
  itemName: string;
  categoryId: string | null;
  categoryName: string | null;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  rate: number;
  value: number;
}

export interface InventoryValuationReport {
  asOfDate: string;
  groupBy: string;
  totalQuantity: number;
  totalValue: number;
  rows: InventoryValuationRow[];
}

// ── API ────────────────────────────────────────────────────────────────────────
export const inventoryReportsApi = createApi({
  reducerPath: "inventoryReportsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/reports/inventory",
    credentials: "include",
  }),
  tagTypes: ["StockSummary", "StockSummaryEnhanced", "StockStatement", "ItemWiseStock", "StockMovement", "InventoryValuation"],
  endpoints: (builder) => ({
    getStockStatement: builder.query<StockStatementReport, StockStatementFilter>({
      query: (params) => ({
        url: "/stock-statement",
        params: {
          fromDate: params.fromDate,
          toDate: params.toDate,
          groupBy: params.groupBy || undefined,
          categoryId: params.categoryId || undefined,
          warehouseId: params.warehouseId || undefined,
          showZeroStock: params.showZeroStock || undefined,
        },
      }),
      transformResponse: (r: ApiResponse<StockStatementReport>) => r.data,
      providesTags: ["StockStatement"],
    }),
    getStockSummaryEnhanced: builder.query<StockSummaryEnhancedReport, StockSummaryEnhancedFilter | void>({
      query: (params) => ({
        url: "/stock-summary-enhanced",
        params: {
          groupBy: params?.groupBy || undefined,
          asOfDate: params?.asOfDate || undefined,
          categoryId: params?.categoryId || undefined,
          warehouseId: params?.warehouseId || undefined,
          showZeroStock: params?.showZeroStock || undefined,
        },
      }),
      transformResponse: (r: ApiResponse<StockSummaryEnhancedReport>) => r.data,
      providesTags: ["StockSummaryEnhanced"],
    }),
    getStockSummary: builder.query<StockSummaryReport, StockSummaryFilter | void>({
      query: (params) => ({
        url: "/stock-summary",
        params: {
          categoryId: params?.categoryId || undefined,
          warehouseId: params?.warehouseId || undefined,
          showZeroStock: params?.showZeroStock || undefined,
        },
      }),
      transformResponse: (r: ApiResponse<StockSummaryReport>) => r.data,
      providesTags: ["StockSummary"],
    }),
    getItemWiseStock: builder.query<ItemWiseStockReport, ItemWiseStockFilter | void>({
      query: (params) => ({
        url: "/item-wise-stock",
        params: {
          fromDate: params?.fromDate || undefined,
          toDate: params?.toDate || undefined,
          itemId: params?.itemId || undefined,
          warehouseId: params?.warehouseId || undefined,
          categoryId: params?.categoryId || undefined,
          showZeroStock: params?.showZeroStock || undefined,
        },
      }),
      transformResponse: (r: ApiResponse<ItemWiseStockReport>) => r.data,
      providesTags: ["ItemWiseStock"],
    }),
    getStockMovement: builder.query<StockMovementReport, StockMovementFilter>({
      query: ({ itemId, warehouseId, fromDate, toDate }) => ({
        url: "/stock-movement",
        params: {
          itemId,
          warehouseId: warehouseId || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        },
      }),
      transformResponse: (r: ApiResponse<StockMovementReport>) => r.data,
      providesTags: ["StockMovement"],
    }),
    getInventoryValuation: builder.query<InventoryValuationReport, InventoryValuationFilter | void>({
      query: (params) => ({
        url: "/inventory-valuation",
        params: {
          groupBy: params?.groupBy || undefined,
          asOfDate: params?.asOfDate || undefined,
          categoryId: params?.categoryId || undefined,
          warehouseId: params?.warehouseId || undefined,
          showZeroStock: params?.showZeroStock || undefined,
        },
      }),
      transformResponse: (r: ApiResponse<InventoryValuationReport>) => r.data,
      providesTags: ["InventoryValuation"],
    }),
  }),
});

export const {
  useGetStockStatementQuery,
  useGetStockSummaryEnhancedQuery,
  useGetStockSummaryQuery,
  useGetItemWiseStockQuery,
  useGetStockMovementQuery,
  useGetInventoryValuationQuery,
} = inventoryReportsApi;
