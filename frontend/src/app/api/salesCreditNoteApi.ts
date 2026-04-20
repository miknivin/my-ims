import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../../types/filtering";

export type SalesCreditNoteNature =
  | "Return"
  | "RateDifference"
  | "DiscountAdjustment"
  | "DamageClaim"
  | "Other";

export type SalesCreditNotePaymentMode = "Cash" | "Credit";

export type SalesCreditNoteTaxApplication =
  | "After Discount"
  | "Before Discount";

export interface SalesCreditNoteListItem {
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

export interface SalesCreditNotePayload {
  noteNature: SalesCreditNoteNature;
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
    paymentMode: SalesCreditNotePaymentMode;
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
    taxApplication: SalesCreditNoteTaxApplication;
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

export const salesCreditNoteApi = createApi({
  reducerPath: "salesCreditNoteApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/transactions/sales-credit-notes",
    credentials: "include",
  }),
  tagTypes: ["SalesCreditNote"],
  endpoints: (builder) => ({
    getSalesCreditNotes: builder.query<SalesCreditNoteListItem[], void>({
      query: () => "/",
      transformResponse: (response: ApiResponse<SalesCreditNoteListItem[]>) =>
        response.data,
      providesTags: ["SalesCreditNote"],
    }),
    createSalesCreditNote: builder.mutation<
      unknown,
      SalesCreditNotePayload
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SalesCreditNote"],
    }),
  }),
});

export const {
  useGetSalesCreditNotesQuery,
  useCreateSalesCreditNoteMutation,
} = salesCreditNoteApi;
