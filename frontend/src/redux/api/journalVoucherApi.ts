import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, PagedResponse } from "@/shared/types/filtering";
import { buildQueryParams } from "./queryUtils";

export interface JournalVoucherFilter {
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  source?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface JournalVoucherListItem {
  id: string;
  voucherNo: string;
  postingDate: string;
  source: string;
  status: string;
  narration: string | null;
  totalDebit: number;
  totalCredit: number;
}

export interface JournalEntryPayload {
  ledgerId: string;
  debitAmount: number;
  creditAmount: number;
}

export interface CreateManualJournalVoucherPayload {
  voucherNo: string;
  postingDate: string;
  narration: string | null;
  entries: JournalEntryPayload[];
}

export interface JournalVoucherEntry {
  id: string;
  lineNo: number;
  ledgerId: string;
  ledgerName: string;
  ledgerCode: string;
  debitAmount: number;
  creditAmount: number;
}

export interface JournalVoucher {
  id: string;
  voucherNo: string;
  postingDate: string;
  source: string;
  status: string;
  narration: string | null;
  totalDebit: number;
  totalCredit: number;
  entries: JournalVoucherEntry[];
}

export const journalVoucherApi = createApi({
  reducerPath: "journalVoucherApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/operations/accounting/journal-vouchers",
    credentials: "include",
  }),
  tagTypes: ["JournalVoucher"],
  endpoints: (builder) => ({
    getJournalVouchers: builder.query<
      PagedResponse<JournalVoucherListItem>,
      JournalVoucherFilter | void
    >({
      query: (params) => ({
        url: "/",
        params: buildQueryParams(params ?? undefined),
      }),
      transformResponse: (
        response: ApiResponse<PagedResponse<JournalVoucherListItem>>,
      ) => response.data,
      providesTags: ["JournalVoucher"],
    }),
    createManualJournalVoucher: builder.mutation<
      JournalVoucher,
      CreateManualJournalVoucherPayload
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<JournalVoucher>) =>
        response.data,
      invalidatesTags: ["JournalVoucher"],
    }),
  }),
});

export const {
  useGetJournalVouchersQuery,
  useCreateManualJournalVoucherMutation,
} = journalVoucherApi;
