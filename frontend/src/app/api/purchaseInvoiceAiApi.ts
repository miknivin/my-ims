import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../../types/filtering";

export interface PurchaseInvoiceAiDraft {
  sourceRef: {
    type: "Direct" | "PurchaseOrder" | "GoodsReceipt";
    referenceId: string | null;
    no: string;
  };
  document: {
    no: string;
    date: string;
    dueDate: string;
  };
  vendorInformation: {
    vendorId: string | null;
    vendorLabel: string;
    address: string;
    attention: string;
    phone: string;
  };
  financialDetails: {
    paymentMode: "Cash" | "Credit";
    supplierInvoiceNo: string;
    lrNo: string;
    currencyId: string | null;
    currencyCode: string;
    currencySymbol: string;
  };
  productInformation: {
    vendorProducts: string;
    ownProductsOnly: boolean;
  };
  general: {
    notes: string;
    searchBarcode: string;
    taxable: boolean;
    taxApplication: "After Discount" | "Before Discount";
    interState: boolean;
    taxOnFoc: boolean;
  };
  items: Array<{
    sno: number;
    productId: string | null;
    productCodeSnapshot: string;
    productNameSnapshot: string;
    hsnCode: string;
    unitId: string | null;
    unitName: string;
    quantity: string;
    foc: string;
    rate: string;
    discountPercent: string;
    taxPercent: string;
    sellingRate: string;
    wholesaleRate: string;
    mrp: string;
    warehouseId: string | null;
    warehouseName: string;
  }>;
  additions: Array<{
    type: "Addition" | "Deduction";
    ledgerId: string | null;
    ledgerName: string;
    description: string;
    amount: string;
  }>;
  footer: {
    notes: string;
  };
}

export interface PurchaseInvoiceAiDeclaredTotals {
  subtotal: number | null;
  tax: number | null;
  addition: number | null;
  deduction: number | null;
  netTotal: number | null;
  computedNetTotal: number | null;
}

export interface PurchaseInvoiceAiMappingResult {
  draft: PurchaseInvoiceAiDraft;
  declaredTotals: PurchaseInvoiceAiDeclaredTotals;
  warnings: string[];
  unresolvedFields: string[];
}

export const purchaseInvoiceAiApi = createApi({
  reducerPath: "purchaseInvoiceAiApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/transactions/purchase-invoice-ai",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    mapPurchaseInvoiceWithAi: builder.mutation<
      PurchaseInvoiceAiMappingResult,
      FormData
    >({
      query: (body) => ({
        url: "/map",
        method: "POST",
        body,
      }),
      transformResponse: (
        response: ApiResponse<PurchaseInvoiceAiMappingResult>,
      ) => response.data,
    }),
  }),
});

export const { useMapPurchaseInvoiceWithAiMutation } = purchaseInvoiceAiApi;
