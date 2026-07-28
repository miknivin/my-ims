import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface InventoryBalanceResponse {
  success: boolean;
  message: string;
  data: {
    valuationRate: number;
    quantityOnHand: number;
  };
}

export interface InventoryBalance {
  valuationRate: number;
  quantityOnHand: number;
  latestProfitPercent: number | null;
}

export const inventoryApi = createApi({
  reducerPath: "inventoryApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/inventory", credentials: "include" }),
  endpoints: (builder) => ({
    getInventoryBalance: builder.query<InventoryBalance, { productId: string; warehouseId?: string }>({
      query: ({ productId, warehouseId }) => {
        const params = new URLSearchParams({ productId });
        if (warehouseId) params.set("warehouseId", warehouseId);
        return `/balance?${params.toString()}`;
      },
      transformResponse: (response: InventoryBalanceResponse) => response.data,
    }),
  }),
});

export const { useLazyGetInventoryBalanceQuery } = inventoryApi;
