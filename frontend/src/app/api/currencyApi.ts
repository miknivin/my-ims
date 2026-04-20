import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type CurrencyStatus = "Active" | "Inactive";

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  status: CurrencyStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CurrencyPayload {
  code: string;
  name: string;
  symbol: string;
  status: CurrencyStatus;
}

export const currencyApi = createApi({
  reducerPath: "currencyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/masters/currencies",
    credentials: "include",
  }),
  tagTypes: ["Currency"],
  endpoints: (builder) => ({
    getCurrencies: builder.query<Currency[], void>({
      query: () => "/",
      transformResponse: (response: ApiResponse<Currency[]>) => response.data,
      providesTags: ["Currency"],
    }),
    createCurrency: builder.mutation<Currency, CurrencyPayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Currency>) => response.data,
      invalidatesTags: ["Currency"],
    }),
    updateCurrency: builder.mutation<Currency, CurrencyPayload & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<Currency>) => response.data,
      invalidatesTags: ["Currency"],
    }),
    deleteCurrency: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Currency"],
    }),
  }),
});

export const {
  useGetCurrenciesQuery,
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
} = currencyApi;
