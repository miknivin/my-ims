import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "@/shared/types/filtering";
import { buildQueryParams } from "./queryUtils";

export interface JournalEntryFilter {
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  ledgerId?: string;
  source?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface JournalEntryRow {
  id: string;
  journalVoucherId: string;
  postingDate: string;
  voucherNo: string;
  source: string;
  status: string;
  lineNo: number;
  ledgerId: string;
  ledgerName: string;
  ledgerCode: string;
  narration: string | null;
  debitAmount: number;
  creditAmount: number;
}

export interface JournalEntryTotals {
  debitAmount: number;
  creditAmount: number;
}

export interface JournalEntryListResponse {
  items: JournalEntryRow[];
  totals: JournalEntryTotals;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy: string | null;
  keyword: string | null;
}

export const journalEntryApi = createApi({
  reducerPath: "journalEntryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/operations/accounting/journal-entries",
    credentials: "include",
  }),
  tagTypes: ["JournalEntry"],
  endpoints: (builder) => ({
    getJournalEntries: builder.query<
      JournalEntryListResponse,
      JournalEntryFilter | void
    >({
      query: (params) => ({
        url: "/",
        params: buildQueryParams(params ?? undefined),
      }),
      transformResponse: (response: ApiResponse<JournalEntryListResponse>) =>
        response.data,
      providesTags: ["JournalEntry"],
    }),
  }),
});

export const { useGetJournalEntriesQuery } = journalEntryApi;
