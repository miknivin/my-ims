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
