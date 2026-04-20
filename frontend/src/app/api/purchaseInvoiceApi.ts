import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../../types/filtering";

export type PurchaseInvoiceReferenceType =
  | "PurchaseOrder"
  | "GoodsReceipt"
  | "Direct";

export type PurchaseInvoicePaymentMode = "Cash" | "Credit";

export type PurchaseInvoiceTaxApplication =
  | "After Discount"
  | "Before Discount";

export interface PurchaseInvoiceSourceReference {
  type: PurchaseInvoiceReferenceType;
  referenceId: string | null;
  referenceNo: string;
}

export interface PurchaseInvoiceDocument {
  no: string;
  date: string;
  dueDate: string;
}

export interface PurchaseInvoiceVendorInformation {
  vendorId: string;
  vendorNameSnapshot: string;
  address: string;
  attention: string | null;
  phone: string | null;
}

export interface PurchaseInvoiceFinancialDetails {
  paymentMode: PurchaseInvoicePaymentMode;
  supplierInvoiceNo: string | null;
  lrNo: string | null;
  currencyId: string | null;
  currencyCodeSnapshot: string | null;
  currencySymbolSnapshot: string | null;
}

export interface PurchaseInvoiceProductInformation {
  vendorProducts: string;
  ownProductsOnly: boolean;
}

export interface PurchaseInvoiceGeneral {
  notes: string | null;
  searchBarcode: string | null;
  taxable: boolean;
  taxApplication: PurchaseInvoiceTaxApplication;
  interState: boolean;
  taxOnFoc: boolean;
}

export interface PurchaseInvoiceLineItem {
  id: string;
  purchaseInvoiceId: string;
  sno: number;
  productId: string;
  productCodeSnapshot: string | null;
  productNameSnapshot: string;
  hsnCode: string | null;
  unitId: string;
  unitName: string;
  quantity: number;
  foc: number;
  rate: number;
  grossAmount: number;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  taxPercent: number;
  taxAmount: number;
  cost: number;
  profitPercent: number;
  profitAmount: number;
  sellingRate: number;
  wholesaleRate: number;
  mrp: number;
  lineTotal: number;
  warehouseId: string | null;
  warehouseName: string | null;
}

export interface PurchaseInvoiceAddition {
  id: string;
  type: "Addition" | "Deduction";
  ledgerId: string | null;
  ledgerNameSnapshot: string;
  description: string | null;
  amount: number;
}

export interface PurchaseInvoiceFooter {
  notes: string | null;
  total: number;
  discount: number;
  addition: number;
  deduction: number;
  netTotal: number;
}

export interface PurchaseInvoice {
  id: string;
  sourceRef: PurchaseInvoiceSourceReference;
  document: PurchaseInvoiceDocument;
  vendorInformation: PurchaseInvoiceVendorInformation;
  financialDetails: PurchaseInvoiceFinancialDetails;
  productInformation: PurchaseInvoiceProductInformation;
  general: PurchaseInvoiceGeneral;
  items: PurchaseInvoiceLineItem[];
  additions: PurchaseInvoiceAddition[];
  footer: PurchaseInvoiceFooter;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface PurchaseInvoiceListItem {
  id: string;
  no: string;
  date: string;
  vendorName: string;
  netTotal: number;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface PurchaseInvoicePayload {
  sourceRef: {
    type: PurchaseInvoiceReferenceType;
    referenceId: string | null;
    referenceNo: string;
  };
  document: {
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
    paymentMode: PurchaseInvoicePaymentMode;
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
    taxApplication: PurchaseInvoiceTaxApplication;
    interState: boolean;
    taxOnFoc: boolean;
  };
  items: Array<{
    sno: number;
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

export const purchaseInvoiceApi = createApi({
  reducerPath: "purchaseInvoiceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/transactions/purchase-invoices",
    credentials: "include",
  }),
  tagTypes: ["PurchaseInvoice"],
  endpoints: (builder) => ({
    getPurchaseInvoices: builder.query<PurchaseInvoiceListItem[], void>({
      query: () => "/",
      transformResponse: (response: ApiResponse<PurchaseInvoiceListItem[]>) =>
        response.data,
      providesTags: ["PurchaseInvoice"],
    }),
    getPurchaseInvoiceById: builder.query<PurchaseInvoice, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: ApiResponse<PurchaseInvoice>) =>
        response.data,
      providesTags: ["PurchaseInvoice"],
    }),
    createPurchaseInvoice: builder.mutation<
      PurchaseInvoice,
      PurchaseInvoicePayload
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<PurchaseInvoice>) =>
        response.data,
      invalidatesTags: ["PurchaseInvoice"],
    }),
    updatePurchaseInvoice: builder.mutation<
      PurchaseInvoice,
      PurchaseInvoicePayload & { id: string; status?: string | null }
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<PurchaseInvoice>) =>
        response.data,
      invalidatesTags: ["PurchaseInvoice"],
    }),
    deletePurchaseInvoice: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PurchaseInvoice"],
    }),
  }),
});

export const {
  useGetPurchaseInvoicesQuery,
  useGetPurchaseInvoiceByIdQuery,
  useLazyGetPurchaseInvoiceByIdQuery,
  useCreatePurchaseInvoiceMutation,
  useUpdatePurchaseInvoiceMutation,
  useDeletePurchaseInvoiceMutation,
} = purchaseInvoiceApi;
