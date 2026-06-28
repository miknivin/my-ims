import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "@/shared/types/filtering";

// ── Bill-wise Receivables / Payables ───────────────────────────────────────────
export interface BillWiseFilter {
  asOfDate?: string;
  customerId?: string;
  vendorId?: string;
}

export interface BillWiseRow {
  id: string;
  documentDate: string;
  dueDate: string;
  documentNo: string;
  referenceNo: string | null;
  partyId: string;
  partyName: string;
  invoiceAmount: number;
  paidAmount: number;
  balanceAmount: number;
  overdueDays: number;
  status: string;
}

export interface BillWiseTotals {
  invoiceAmount: number;
  paidAmount: number;
  balanceAmount: number;
}

export interface BillWiseReport {
  asOfDate: string;
  totals: BillWiseTotals;
  rows: BillWiseRow[];
}

// ── Ageing ──────────────────────────────────────────────────────────────────
export interface AgeingFilter {
  asOfDate?: string;
}

export interface AgeingBuckets {
  current: number;
  days1To30: number;
  days31To60: number;
  days61To90: number;
  over90: number;
  total: number;
}

export interface AgeingRow {
  partyId: string;
  partyName: string;
  buckets: AgeingBuckets;
}

export interface AgeingReport {
  asOfDate: string;
  totals: AgeingBuckets;
  rows: AgeingRow[];
}

// ── API ────────────────────────────────────────────────────────────────────────
export const receivablesPayablesApi = createApi({
  reducerPath: "receivablesPayablesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/reports/receivables-payables",
    credentials: "include",
  }),
  tagTypes: ["ReceivablesAgeing", "PayablesAgeing", "BillWiseReceivables", "BillWisePayables"],
  endpoints: (builder) => ({
    getReceivablesAgeing: builder.query<AgeingReport, AgeingFilter | void>({
      query: (params) => ({
        url: "/receivables-ageing",
        params: { asOfDate: params?.asOfDate || undefined },
      }),
      transformResponse: (r: ApiResponse<AgeingReport>) => r.data,
      providesTags: ["ReceivablesAgeing"],
    }),
    getPayablesAgeing: builder.query<AgeingReport, AgeingFilter | void>({
      query: (params) => ({
        url: "/payables-ageing",
        params: { asOfDate: params?.asOfDate || undefined },
      }),
      transformResponse: (r: ApiResponse<AgeingReport>) => r.data,
      providesTags: ["PayablesAgeing"],
    }),
    getBillWiseReceivables: builder.query<BillWiseReport, BillWiseFilter | void>({
      query: (params) => ({
        url: "/bill-wise-receivables",
        params: {
          asOfDate: params?.asOfDate || undefined,
          customerId: params?.customerId || undefined,
        },
      }),
      transformResponse: (r: ApiResponse<BillWiseReport>) => r.data,
      providesTags: ["BillWiseReceivables"],
    }),
    getBillWisePayables: builder.query<BillWiseReport, BillWiseFilter | void>({
      query: (params) => ({
        url: "/bill-wise-payables",
        params: {
          asOfDate: params?.asOfDate || undefined,
          vendorId: params?.vendorId || undefined,
        },
      }),
      transformResponse: (r: ApiResponse<BillWiseReport>) => r.data,
      providesTags: ["BillWisePayables"],
    }),
  }),
});

export const {
  useGetReceivablesAgeingQuery,
  useGetPayablesAgeingQuery,
  useGetBillWiseReceivablesQuery,
  useGetBillWisePayablesQuery,
} = receivablesPayablesApi;
