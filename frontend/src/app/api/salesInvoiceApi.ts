import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../../types/filtering";
import { buildQueryParams } from "./queryUtils";

export type SalesInvoiceReferenceType =
  | "SalesOrder"
  | "DeliveryNote"
  | "Direct";

export type SalesInvoicePaymentMode = "Cash" | "Credit";

export type SalesInvoiceTaxApplication =
  | "After Discount"
  | "Before Discount";

export interface SalesInvoiceSourceReference {
  type: SalesInvoiceReferenceType;
  referenceId: string | null;
  referenceNo: string;
}

export interface SalesInvoiceDocument {
  voucherType: string;
  no: string;
  date: string;
  dueDate: string;
}

export interface SalesInvoiceCustomerInformation {
  customerId: string;
  customerNameSnapshot: string;
  address: string;
}

export interface SalesInvoiceFinancialDetails {
  paymentMode: SalesInvoicePaymentMode;
  invoiceNo: string | null;
  lrNo: string | null;
  currencyId: string | null;
  currencyCodeSnapshot: string | null;
  currencySymbolSnapshot: string | null;
  balance: number;
}

export interface SalesInvoiceGeneral {
  notes: string | null;
  taxable: boolean;
  taxApplication: SalesInvoiceTaxApplication;
  interState: boolean;
}

export interface SalesInvoiceLineItem {
  id: string;
  salesInvoiceId: string;
  sno: number;
  productId: string;
  productCodeSnapshot: string | null;
  productNameSnapshot: string;
  hsnCode: string | null;
  unitId: string;
  unitName: string;
  quantity: number;
  rate: number;
  grossAmount: number;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  taxPercent: number;
  taxAmount: number;
  costRate: number;
  cogsAmount: number;
  grossProfitAmount: number;
  lineTotal: number;
  warehouseId: string | null;
  warehouseName: string | null;
}

export interface SalesInvoiceAddition {
  id: string;
  type: "Addition" | "Deduction";
  ledgerId: string | null;
  ledgerNameSnapshot: string;
  description: string | null;
  amount: number;
}

export interface SalesInvoiceFooter {
  notes: string | null;
  total: number;
  addition: number;
  deduction: number;
  paid: number;
  netTotal: number;
}

export interface SalesInvoice {
  id: string;
  sourceRef: SalesInvoiceSourceReference;
  document: SalesInvoiceDocument;
  customerInformation: SalesInvoiceCustomerInformation;
  financialDetails: SalesInvoiceFinancialDetails;
  general: SalesInvoiceGeneral;
  items: SalesInvoiceLineItem[];
  additions: SalesInvoiceAddition[];
  footer: SalesInvoiceFooter;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface SalesInvoiceListItem {
  id: string;
  no: string;
  date: string;
  customerName: string;
  netTotal: number;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface SalesInvoicePayload {
  sourceRef: {
    type: SalesInvoiceReferenceType;
    referenceId: string | null;
    referenceNo: string;
  };
  document: {
    voucherType: string;
    no: string;
    date: string;
    dueDate: string;
  };
  customerInformation: {
    customerId: string;
    customerNameSnapshot: string;
    address: string;
  };
  financialDetails: {
    paymentMode: SalesInvoicePaymentMode;
    invoiceNo: string | null;
    lrNo: string | null;
    currencyId: string | null;
    currencyCodeSnapshot: string | null;
    currencySymbolSnapshot: string | null;
    balance: number;
  };
  general: {
    notes: string | null;
    taxable: boolean;
    taxApplication: SalesInvoiceTaxApplication;
    interState: boolean;
  };
  items: Array<{
    sno: number;
    productId: string;
    productCodeSnapshot: string | null;
    productNameSnapshot: string;
    hsnCode: string | null;
    unitId: string;
    quantity: number;
    rate: number;
    discountPercent: number;
    taxPercent: number;
    warehouseId: string | null;
  }>;
  additions: Array<{
    type: "Addition" | "Deduction";
    ledgerId: string | null;
    ledgerNameSnapshot: string | null;
    description: string | null;
    amount: number;
  }>;
  footer: {
    notes: string | null;
    paid: number;
  };
}

export interface SalesInvoiceListQueryParams {
  keyword?: string;
  limit?: number;
}

export const salesInvoiceApi = createApi({
  reducerPath: "salesInvoiceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/transactions/sales-invoices",
    credentials: "include",
  }),
  tagTypes: ["SalesInvoice"],
  endpoints: (builder) => ({
    getSalesInvoices: builder.query<SalesInvoiceListItem[], SalesInvoiceListQueryParams | void>({
      query: (params) => ({
        url: "/",
        params: buildQueryParams(params ?? undefined),
      }),
      transformResponse: (response: ApiResponse<SalesInvoiceListItem[]>) =>
        response.data,
      providesTags: ["SalesInvoice"],
    }),
    getSalesInvoiceById: builder.query<SalesInvoice, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: ApiResponse<SalesInvoice>) =>
        response.data,
      providesTags: ["SalesInvoice"],
    }),
    createSalesInvoice: builder.mutation<SalesInvoice, SalesInvoicePayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<SalesInvoice>) =>
        response.data,
      invalidatesTags: ["SalesInvoice"],
    }),
    updateSalesInvoice: builder.mutation<
      SalesInvoice,
      SalesInvoicePayload & { id: string; status?: string | null }
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<SalesInvoice>) =>
        response.data,
      invalidatesTags: ["SalesInvoice"],
    }),
    deleteSalesInvoice: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SalesInvoice"],
    }),
  }),
});

export const {
  useGetSalesInvoicesQuery,
  useLazyGetSalesInvoicesQuery,
  useGetSalesInvoiceByIdQuery,
  useLazyGetSalesInvoiceByIdQuery,
  useCreateSalesInvoiceMutation,
  useUpdateSalesInvoiceMutation,
  useDeleteSalesInvoiceMutation,
} = salesInvoiceApi;
