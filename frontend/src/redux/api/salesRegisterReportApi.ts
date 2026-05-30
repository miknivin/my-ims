import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "@/shared/types/filtering";
import { buildQueryParams } from "./queryUtils";

export interface SalesRegisterFilter {
  fromDate?: string;
  toDate?: string;
  customerId?: string;
  status?: string;
  keyword?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface SalesRegisterRow {
  id: string;
  invoiceDate: string;
  dueDate: string;
  invoiceNo: string;
  referenceNo: string | null;
  customerId: string;
  customerName: string;
  grossAmount: number;
  discountAmount: number;
  additionAmount: number;
  deductionAmount: number;
  taxableAmount: number;
  taxAmount: number;
  netAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
}

export interface SalesRegisterTotals {
  grossAmount: number;
  discountAmount: number;
  additionAmount: number;
  deductionAmount: number;
  taxableAmount: number;
  taxAmount: number;
  netAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

export interface SalesRegisterReport {
  items: SalesRegisterRow[];
  totals: SalesRegisterTotals;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy: string | null;
  keyword: string | null;
}

export const salesRegisterReportApi = createApi({
  reducerPath: "salesRegisterReportApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/reports/sales-purchase/sales-register",
    credentials: "include",
  }),
  tagTypes: ["SalesRegisterReport"],
  endpoints: (builder) => ({
    getSalesRegister: builder.query<SalesRegisterReport, SalesRegisterFilter | void>({
      query: (params) => ({
        url: "/",
        params: buildQueryParams(params ?? undefined),
      }),
      transformResponse: (response: ApiResponse<SalesRegisterReport>) =>
        response.data,
      providesTags: ["SalesRegisterReport"],
    }),
  }),
});

export const { useGetSalesRegisterQuery } = salesRegisterReportApi;
