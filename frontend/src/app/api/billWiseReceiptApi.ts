import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../../types/filtering";

export interface BillWiseReceiptDocument {
  voucherType: string;
  no: string;
  date: string;
}

export interface BillWiseReceiptCustomerInformation {
  customerId: string;
  customerNameSnapshot: string;
  address: string;
}

export interface BillWiseReceiptAccountInformation {
  ledgerId: string;
  ledgerNameSnapshot: string;
}

export interface BillWiseReceiptDetails {
  referenceNo: string | null;
  instrumentNo: string | null;
  instrumentDate: string | null;
  notes: string | null;
  totalAllocated: number;
  totalDiscount: number;
  advance: number;
  amount: number;
}

export interface BillWiseReceiptAllocation {
  id: string;
  salesInvoiceId: string;
  sno: number;
  sourceVoucherType: string;
  sourceNo: string;
  sourceDate: string;
  sourceDueDate: string | null;
  sourceReferenceNo: string | null;
  descriptionSnapshot: string | null;
  originalAmount: number;
  outstandingBefore: number;
  paidAmount: number;
  discountAmount: number;
  outstandingAfter: number;
}

export interface BillWiseReceipt {
  id: string;
  document: BillWiseReceiptDocument;
  customerInformation: BillWiseReceiptCustomerInformation;
  accountInformation: BillWiseReceiptAccountInformation;
  receiptDetails: BillWiseReceiptDetails;
  allocations: BillWiseReceiptAllocation[];
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface BillWiseReceiptListItem {
  id: string;
  no: string;
  date: string;
  customerName: string;
  amount: number;
  totalAllocated: number;
  totalDiscount: number;
  advance: number;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface BillWiseReceiptOutstandingInvoice {
  salesInvoiceId: string;
  no: string;
  date: string;
  dueDate: string;
  referenceNo: string;
  description: string | null;
  originalAmount: number;
  outstandingBalance: number;
}

export interface BillWiseReceiptPayload {
  document: {
    no: string;
    date: string;
  };
  customerInformation: {
    customerId: string;
    customerNameSnapshot: string;
    address: string;
  };
  accountInformation: {
    ledgerId: string;
    ledgerNameSnapshot: string | null;
  };
  receiptDetails: {
    referenceNo: string | null;
    instrumentNo: string | null;
    instrumentDate: string | null;
    notes: string | null;
    advance: number;
  };
  allocations: Array<{
    sno: number;
    salesInvoiceId: string;
    paidAmount: number;
    discountAmount: number;
  }>;
  status?: string | null;
}

export const billWiseReceiptApi = createApi({
  reducerPath: "billWiseReceiptApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/transactions/bill-wise-receipts",
    credentials: "include",
  }),
  tagTypes: ["BillWiseReceipt"],
  endpoints: (builder) => ({
    getBillWiseReceipts: builder.query<BillWiseReceiptListItem[], void>({
      query: () => "/",
      transformResponse: (response: ApiResponse<BillWiseReceiptListItem[]>) =>
        response.data,
      providesTags: ["BillWiseReceipt"],
    }),
    getBillWiseReceiptById: builder.query<BillWiseReceipt, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: ApiResponse<BillWiseReceipt>) =>
        response.data,
      providesTags: ["BillWiseReceipt"],
    }),
    getBillWiseReceiptOutstandingInvoices: builder.query<
      BillWiseReceiptOutstandingInvoice[],
      string
    >({
      query: (customerId) => ({
        url: "/outstanding-invoices",
        params: { customerId },
      }),
      transformResponse: (
        response: ApiResponse<BillWiseReceiptOutstandingInvoice[]>,
      ) => response.data,
    }),
    createBillWiseReceipt: builder.mutation<
      BillWiseReceipt,
      BillWiseReceiptPayload
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<BillWiseReceipt>) =>
        response.data,
      invalidatesTags: ["BillWiseReceipt"],
    }),
    updateBillWiseReceipt: builder.mutation<
      BillWiseReceipt,
      BillWiseReceiptPayload & { id: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<BillWiseReceipt>) =>
        response.data,
      invalidatesTags: ["BillWiseReceipt"],
    }),
    deleteBillWiseReceipt: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BillWiseReceipt"],
    }),
  }),
});

export const {
  useGetBillWiseReceiptsQuery,
  useGetBillWiseReceiptByIdQuery,
  useGetBillWiseReceiptOutstandingInvoicesQuery,
  useCreateBillWiseReceiptMutation,
  useUpdateBillWiseReceiptMutation,
  useDeleteBillWiseReceiptMutation,
} = billWiseReceiptApi;
