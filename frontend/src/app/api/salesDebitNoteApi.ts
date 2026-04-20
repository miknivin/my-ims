import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../../types/filtering";

export type SalesDebitNoteNature =
  | "RateDifference"
  | "DiscountAdjustment"
  | "DamageClaim"
  | "Other";

export type SalesDebitNotePaymentMode = "Cash" | "Credit";

export type SalesDebitNoteTaxApplication =
  | "After Discount"
  | "Before Discount";

export interface SalesDebitNoteListItem {
  id: string;
  no: string;
  date: string;
  counterpartyName: string;
  netTotal: number;
  noteNature: string;
  inventoryEffect: string;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface SalesDebitNotePayload {
  noteNature: SalesDebitNoteNature;
  sourceRef: {
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
    paymentMode: SalesDebitNotePaymentMode;
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
    taxApplication: SalesDebitNoteTaxApplication;
    interState: boolean;
  };
  items: Array<{
    sourceLineId: string;
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

export const salesDebitNoteApi = createApi({
  reducerPath: "salesDebitNoteApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/transactions/sales-debit-notes",
    credentials: "include",
  }),
  tagTypes: ["SalesDebitNote"],
  endpoints: (builder) => ({
    getSalesDebitNotes: builder.query<SalesDebitNoteListItem[], void>({
      query: () => "/",
      transformResponse: (response: ApiResponse<SalesDebitNoteListItem[]>) =>
        response.data,
      providesTags: ["SalesDebitNote"],
    }),
    createSalesDebitNote: builder.mutation<unknown, SalesDebitNotePayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SalesDebitNote"],
    }),
  }),
});

export const {
  useGetSalesDebitNotesQuery,
  useCreateSalesDebitNoteMutation,
} = salesDebitNoteApi;
