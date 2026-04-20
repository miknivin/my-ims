import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type TaxType = "percentage" | "fixed" | "slab";
export type TaxStatus = "Active" | "Inactive" | "Draft";

export interface TaxSlab {
  id: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
}

export interface Tax {
  id: string;
  name: string;
  code: string;
  description: string;
  type: TaxType;
  rate: number | null;
  slabs: TaxSlab[];
  status: TaxStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface TaxPayload {
  name: string;
  code: string;
  description: string;
  type: TaxType;
  rate: number | null;
  slabs: Array<{
    fromAmount: number;
    toAmount: number;
    rate: number;
  }>;
  status: TaxStatus;
}

export const taxApi = createApi({
  reducerPath: "taxApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/masters/taxes",
    credentials: "include",
  }),
  tagTypes: ["Tax"],
  endpoints: (builder) => ({
    getTaxes: builder.query<Tax[], void>({
      query: () => "/",
      transformResponse: (response: ApiResponse<Tax[]>) => response.data,
      providesTags: ["Tax"],
    }),
    createTax: builder.mutation<Tax, TaxPayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Tax>) => response.data,
      invalidatesTags: ["Tax"],
    }),
    updateTax: builder.mutation<Tax, TaxPayload & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<Tax>) => response.data,
      invalidatesTags: ["Tax"],
    }),
    deleteTax: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tax"],
    }),
  }),
});

export const {
  useGetTaxesQuery,
  useCreateTaxMutation,
  useUpdateTaxMutation,
  useDeleteTaxMutation,
} = taxApi;
