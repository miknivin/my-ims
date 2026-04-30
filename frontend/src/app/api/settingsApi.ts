import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../../types/filtering";

export type InventoryValuationMethod = "Moving Average" | "FIFO";

export interface AppSettings {
  id: string;
  general: {
    businessName: string;
    contactPerson: string | null;
    phone: string | null;
    email: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    country: string | null;
    gstin: string | null;
    pan: string | null;
  };
  inventorySettings: {
    stockControl: {
      allowNegativeStock: boolean;
      trackInventoryByWarehouse: boolean;
      defaultWarehouseId: string | null;
      defaultWarehouseName: string | null;
      blockSaleWhenStockUnavailable: boolean;
      autoUpdateStockOnInvoicePosting: boolean;
    };
    costing: {
      valuationMethod: InventoryValuationMethod;
      costPrecision: number;
      roundingPrecision: number;
      includeLandedCostInInventoryCost: boolean;
    };
    batchSerial: {
      enableBatchTracking: boolean;
      enableSerialTracking: boolean;
      requireExpiryForBatchItems: boolean;
    };
  };
  accountingSettings: {
    discountAllowedLedgerId: string | null;
    discountAllowedLedgerName: string | null;
    discountReceivedLedgerId: string | null;
    discountReceivedLedgerName: string | null;
    inventoryLedgerId: string | null;
    inventoryLedgerName: string | null;
    salesLedgerId: string | null;
    salesLedgerName: string | null;
    costOfGoodsSoldLedgerId: string | null;
    costOfGoodsSoldLedgerName: string | null;
    grnClearingLedgerId: string | null;
    grnClearingLedgerName: string | null;
    purchaseTaxLedgerId: string | null;
    purchaseTaxLedgerName: string | null;
    salesTaxLedgerId: string | null;
    salesTaxLedgerName: string | null;
    defaultCashLedgerId: string | null;
    defaultCashLedgerName: string | null;
    grnAdditionLedgerId: string | null;
    grnAdditionLedgerName: string | null;
    grnDiscountLedgerId: string | null;
    grnDiscountLedgerName: string | null;
    roundOffLedgerId: string | null;
    roundOffLedgerName: string | null;
  };
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface AppSettingsPayload {
  general: {
    businessName: string;
    contactPerson: string | null;
    phone: string | null;
    email: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    country: string | null;
    gstin: string | null;
    pan: string | null;
  };
  inventorySettings: {
    stockControl: {
      allowNegativeStock: boolean;
      trackInventoryByWarehouse: boolean;
      defaultWarehouseId: string | null;
      blockSaleWhenStockUnavailable: boolean;
      autoUpdateStockOnInvoicePosting: boolean;
    };
    costing: {
      valuationMethod: InventoryValuationMethod;
      costPrecision: number;
      roundingPrecision: number;
      includeLandedCostInInventoryCost: boolean;
    };
    batchSerial: {
      enableBatchTracking: boolean;
      enableSerialTracking: boolean;
      requireExpiryForBatchItems: boolean;
    };
  };
  accountingSettings: {
    discountAllowedLedgerId: string | null;
    discountReceivedLedgerId: string | null;
    inventoryLedgerId: string | null;
    salesLedgerId: string | null;
    costOfGoodsSoldLedgerId: string | null;
    grnClearingLedgerId: string | null;
    purchaseTaxLedgerId: string | null;
    salesTaxLedgerId: string | null;
    defaultCashLedgerId: string | null;
    grnAdditionLedgerId: string | null;
    grnDiscountLedgerId: string | null;
    roundOffLedgerId: string | null;
  };
}

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/settings",
    credentials: "include",
  }),
  tagTypes: ["Settings"],
  endpoints: (builder) => ({
    getSettings: builder.query<AppSettings, void>({
      query: () => "/",
      transformResponse: (response: ApiResponse<AppSettings>) => response.data,
      providesTags: ["Settings"],
    }),
    updateSettings: builder.mutation<AppSettings, AppSettingsPayload>({
      query: (body) => ({
        url: "/",
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<AppSettings>) => response.data,
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
