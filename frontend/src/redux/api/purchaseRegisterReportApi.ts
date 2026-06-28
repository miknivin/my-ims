import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "@/shared/types/filtering";
import { buildQueryParams } from "./queryUtils";

export interface PurchaseRegisterFilter {
  fromDate?: string;
  toDate?: string;
  vendorId?: string;
  status?: string;
  keyword?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface PurchaseRegisterRow {
  id: string;
  invoiceDate: string;
  dueDate: string;
  invoiceNo: string;
  referenceNo: string | null;
  vendorId: string;
  vendorName: string;
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

export interface PurchaseRegisterTotals {
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

export interface PurchaseRegisterReport {
  items: PurchaseRegisterRow[];
  totals: PurchaseRegisterTotals;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy: string | null;
  keyword: string | null;
}

export const purchaseRegisterReportApi = createApi({
  reducerPath: "purchaseRegisterReportApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/reports/sales-purchase/purchase-register",
    credentials: "include",
  }),
  tagTypes: ["PurchaseRegisterReport"],
  endpoints: (builder) => ({
    getPurchaseRegister: builder.query<PurchaseRegisterReport, PurchaseRegisterFilter | void>({
      query: (params) => ({
        url: "/",
        params: buildQueryParams(params ?? undefined),
      }),
      transformResponse: (response: ApiResponse<PurchaseRegisterReport>) =>
        response.data,
      providesTags: ["PurchaseRegisterReport"],
    }),
  }),
});

export const { useGetPurchaseRegisterQuery } = purchaseRegisterReportApi;
