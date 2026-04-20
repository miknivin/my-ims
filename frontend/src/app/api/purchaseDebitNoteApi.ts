import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../../types/filtering";

export type PurchaseDebitNoteNature =
  | "Return"
  | "RateDifference"
  | "DiscountAdjustment"
  | "DamageClaim"
  | "Other";

export type PurchaseDebitNotePaymentMode = "Cash" | "Credit";

export type PurchaseDebitNoteTaxApplication =
  | "After Discount"
  | "Before Discount";

export interface PurchaseDebitNoteListItem {
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

export interface PurchaseDebitNotePayload {
  noteNature: PurchaseDebitNoteNature;
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
  vendorInformation: {
    vendorId: string;
    vendorNameSnapshot: string;
    address: string;
    attention: string | null;
    phone: string | null;
  };
  financialDetails: {
    paymentMode: PurchaseDebitNotePaymentMode;
    supplierInvoiceNo: string | null;
    lrNo: string | null;
    currencyId: string | null;
    currencyCodeSnapshot: string | null;
    currencySymbolSnapshot: string | null;
  };
  productInformation: {
    vendorProducts: string;
    ownProductsOnly: boolean;
  };
  general: {
    notes: string | null;
    searchBarcode: string | null;
    taxable: boolean;
    taxApplication: PurchaseDebitNoteTaxApplication;
    interState: boolean;
    taxOnFoc: boolean;
  };
  items: Array<{
    sno: number;
    sourceLineId: string;
    productId: string;
    productCodeSnapshot: string | null;
    productNameSnapshot: string;
    hsnCode: string | null;
    unitId: string;
    quantity: number;
    foc: number;
    rate: number;
    discountPercent: number;
    taxPercent: number;
    sellingRate: number;
    wholesaleRate: number;
    mrp: number;
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
  };
}

export const purchaseDebitNoteApi = createApi({
  reducerPath: "purchaseDebitNoteApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/transactions/purchase-debit-notes",
    credentials: "include",
  }),
  tagTypes: ["PurchaseDebitNote"],
  endpoints: (builder) => ({
    getPurchaseDebitNotes: builder.query<PurchaseDebitNoteListItem[], void>({
      query: () => "/",
      transformResponse: (
        response: ApiResponse<PurchaseDebitNoteListItem[]>,
      ) => response.data,
      providesTags: ["PurchaseDebitNote"],
    }),
    createPurchaseDebitNote: builder.mutation<
      unknown,
      PurchaseDebitNotePayload
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PurchaseDebitNote"],
    }),
  }),
});

export const {
  useGetPurchaseDebitNotesQuery,
  useCreatePurchaseDebitNoteMutation,
} = purchaseDebitNoteApi;
