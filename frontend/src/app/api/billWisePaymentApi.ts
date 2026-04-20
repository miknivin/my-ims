import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../../types/filtering";

export interface BillWisePaymentDocument {
  voucherType: string;
  no: string;
  date: string;
}

export interface BillWisePaymentVendorInformation {
  vendorId: string;
  vendorNameSnapshot: string;
  address: string;
  attention: string | null;
  phone: string | null;
}

export interface BillWisePaymentAccountInformation {
  ledgerId: string;
  ledgerNameSnapshot: string;
}

export interface BillWisePaymentPaymentDetails {
  referenceNo: string | null;
  instrumentNo: string | null;
  instrumentDate: string | null;
  notes: string | null;
  totalAllocated: number;
  totalDiscount: number;
  advance: number;
  amount: number;
}

export interface BillWisePaymentAllocation {
  id: string;
  purchaseInvoiceId: string;
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

export interface BillWisePayment {
  id: string;
  document: BillWisePaymentDocument;
  vendorInformation: BillWisePaymentVendorInformation;
  accountInformation: BillWisePaymentAccountInformation;
  paymentDetails: BillWisePaymentPaymentDetails;
  allocations: BillWisePaymentAllocation[];
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface BillWisePaymentListItem {
  id: string;
  no: string;
  date: string;
  vendorName: string;
  amount: number;
  totalAllocated: number;
  totalDiscount: number;
  advance: number;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface BillWisePaymentOutstandingInvoice {
  purchaseInvoiceId: string;
  no: string;
  date: string;
  dueDate: string;
  referenceNo: string;
  description: string | null;
  originalAmount: number;
  outstandingBalance: number;
}

export interface BillWisePaymentPayload {
  document: {
    no: string;
    date: string;
  };
  vendorInformation: {
    vendorId: string;
    vendorNameSnapshot: string;
    address: string;
    attention: string | null;
    phone: string | null;
  };
  accountInformation: {
    ledgerId: string;
    ledgerNameSnapshot: string | null;
  };
  paymentDetails: {
    referenceNo: string | null;
    instrumentNo: string | null;
    instrumentDate: string | null;
    notes: string | null;
    advance: number;
  };
  allocations: Array<{
    sno: number;
    purchaseInvoiceId: string;
    paidAmount: number;
    discountAmount: number;
  }>;
  status?: string | null;
}

export const billWisePaymentApi = createApi({
  reducerPath: "billWisePaymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/transactions/bill-wise-payments",
    credentials: "include",
  }),
  tagTypes: ["BillWisePayment"],
  endpoints: (builder) => ({
    getBillWisePayments: builder.query<BillWisePaymentListItem[], void>({
      query: () => "/",
      transformResponse: (response: ApiResponse<BillWisePaymentListItem[]>) =>
        response.data,
      providesTags: ["BillWisePayment"],
    }),
    getBillWisePaymentById: builder.query<BillWisePayment, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: ApiResponse<BillWisePayment>) =>
        response.data,
      providesTags: ["BillWisePayment"],
    }),
    getBillWisePaymentOutstandingInvoices: builder.query<
      BillWisePaymentOutstandingInvoice[],
      string
    >({
      query: (vendorId) => ({
        url: "/outstanding-invoices",
        params: { vendorId },
      }),
      transformResponse: (
        response: ApiResponse<BillWisePaymentOutstandingInvoice[]>,
      ) => response.data,
    }),
    createBillWisePayment: builder.mutation<
      BillWisePayment,
      BillWisePaymentPayload
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<BillWisePayment>) =>
        response.data,
      invalidatesTags: ["BillWisePayment"],
    }),
    updateBillWisePayment: builder.mutation<
      BillWisePayment,
      BillWisePaymentPayload & { id: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<BillWisePayment>) =>
        response.data,
      invalidatesTags: ["BillWisePayment"],
    }),
    deleteBillWisePayment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BillWisePayment"],
    }),
  }),
});

export const {
  useGetBillWisePaymentsQuery,
  useGetBillWisePaymentByIdQuery,
  useGetBillWisePaymentOutstandingInvoicesQuery,
  useCreateBillWisePaymentMutation,
  useUpdateBillWisePaymentMutation,
  useDeleteBillWisePaymentMutation,
} = billWisePaymentApi;
