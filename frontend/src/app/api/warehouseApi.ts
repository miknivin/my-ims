import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type WarehouseStatus = "Active" | "Inactive";

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: WarehouseStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface WarehousePayload {
  code: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: WarehouseStatus;
}

export const warehouseApi = createApi({
  reducerPath: "warehouseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/masters/warehouses",
    credentials: "include",
  }),
  tagTypes: ["Warehouse"],
  endpoints: (builder) => ({
    getWarehouses: builder.query<Warehouse[], void>({
      query: () => "/",
      transformResponse: (response: ApiResponse<Warehouse[]>) => response.data,
      providesTags: ["Warehouse"],
    }),
    createWarehouse: builder.mutation<Warehouse, WarehousePayload>({
      query: (body) => ({ url: "/", method: "POST", body }),
      transformResponse: (response: ApiResponse<Warehouse>) => response.data,
      invalidatesTags: ["Warehouse"],
    }),
    updateWarehouse: builder.mutation<Warehouse, WarehousePayload & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/${id}`, method: "PUT", body }),
      transformResponse: (response: ApiResponse<Warehouse>) => response.data,
      invalidatesTags: ["Warehouse"],
    }),
    deleteWarehouse: builder.mutation<void, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: ["Warehouse"],
    }),
  }),
});

export const {
  useGetWarehousesQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehouseApi;
