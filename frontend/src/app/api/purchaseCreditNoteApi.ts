import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../../types/filtering";

export type PurchaseCreditNoteNature =
  | "RateDifference"
  | "DiscountAdjustment"
  | "DamageClaim"
  | "Other";

export type PurchaseCreditNotePaymentMode = "Cash" | "Credit";

export type PurchaseCreditNoteTaxApplication =
  | "After Discount"
  | "Before Discount";

export interface PurchaseCreditNoteListItem {
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

export interface PurchaseCreditNotePayload {
  noteNature: PurchaseCreditNoteNature;
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
    paymentMode: PurchaseCreditNotePaymentMode;
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
    taxApplication: PurchaseCreditNoteTaxApplication;
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

export const purchaseCreditNoteApi = createApi({
  reducerPath: "purchaseCreditNoteApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/transactions/purchase-credit-notes",
    credentials: "include",
  }),
  tagTypes: ["PurchaseCreditNote"],
  endpoints: (builder) => ({
    getPurchaseCreditNotes: builder.query<PurchaseCreditNoteListItem[], void>({
      query: () => "/",
      transformResponse: (
        response: ApiResponse<PurchaseCreditNoteListItem[]>,
      ) => response.data,
      providesTags: ["PurchaseCreditNote"],
    }),
    createPurchaseCreditNote: builder.mutation<
      unknown,
      PurchaseCreditNotePayload
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PurchaseCreditNote"],
    }),
  }),
});

export const {
  useGetPurchaseCreditNotesQuery,
  useCreatePurchaseCreditNoteMutation,
} = purchaseCreditNoteApi;
