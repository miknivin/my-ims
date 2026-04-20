import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type LedgerStatus = "Active" | "Inactive";

export interface Ledger {
  id: string;
  code: string;
  name: string;
  alias: string | null;
  ledgerGroupId: string;
  ledgerGroupName: string;
  ledgerGroupNature: string;
  defaultCurrencyId: string | null;
  defaultCurrencyCode: string | null;
  status: LedgerStatus;
  isSystem: boolean;
  allowManualPosting: boolean;
  isBillWise: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LedgerPayload {
  code: string;
  name: string;
  alias: string | null;
  ledgerGroupId: string;
  defaultCurrencyId: string | null;
  status: LedgerStatus;
  allowManualPosting: boolean;
  isBillWise: boolean;
}

export const ledgerApi = createApi({
  reducerPath: "ledgerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/masters/ledgers",
    credentials: "include",
  }),
  tagTypes: ["Ledger"],
  endpoints: (builder) => ({
    getLedgers: builder.query<Ledger[], void>({
      query: () => "/",
      transformResponse: (response: ApiResponse<Ledger[]>) => response.data,
      providesTags: ["Ledger"],
    }),
    createLedger: builder.mutation<Ledger, LedgerPayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Ledger>) => response.data,
      invalidatesTags: ["Ledger"],
    }),
    updateLedger: builder.mutation<Ledger, LedgerPayload & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<Ledger>) => response.data,
      invalidatesTags: ["Ledger"],
    }),
    deleteLedger: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Ledger"],
    }),
  }),
});

export const {
  useGetLedgersQuery,
  useCreateLedgerMutation,
  useUpdateLedgerMutation,
  useDeleteLedgerMutation,
} = ledgerApi;
