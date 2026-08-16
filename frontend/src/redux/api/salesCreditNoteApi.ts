import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "@/shared/types/filtering";

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

export interface SalesCreditNoteLineItem {
  id: string;
  sno: number;
  productNameSnapshot: string;
  hsnCode: string | null;
  unitName: string;
  quantity: number;
  rate: number;
  grossAmount: number;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  taxPercent: number;
  taxAmount: number;
  lineTotal: number;
  warehouseId: string | null;
  warehouseName: string | null;
}

export interface SalesCreditNoteAddition {
  id: string;
  type: "Addition" | "Deduction";
  ledgerNameSnapshot: string;
  description: string | null;
  amount: number;
}

export interface SalesCreditNote {
  id: string;
  noteNature: string;
  affectsInventory: boolean;
  inventoryEffect: string;
  sourceRef: { referenceId: string | null; referenceNo: string };
  document: { voucherType: string; no: string; date: string; dueDate: string };
  customerInformation: { customerNameSnapshot: string; address: string };
  financialDetails: { paymentMode: string; invoiceNo: string | null; lrNo: string | null; currencyCodeSnapshot: string | null; balance: number };
  general: { notes: string | null; taxable: boolean; taxApplication: string; interState: boolean };
  items: SalesCreditNoteLineItem[];
  additions: SalesCreditNoteAddition[];
  footer: { notes: string | null; total: number; discount: number; addition: number; deduction: number; paid: number; netTotal: number };
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

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
    getSalesCreditNoteById: builder.query<SalesCreditNote, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: ApiResponse<SalesCreditNote>) => response.data,
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
  useGetSalesCreditNoteByIdQuery,
  useCreateSalesCreditNoteMutation,
} = salesCreditNoteApi;
