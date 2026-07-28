import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "@/shared/types/filtering";
import { buildQueryParams } from "./queryUtils";

export interface PurchaseOrderOrderDetails {
  voucherType: string;
  no: string;
  date: string;
  dueDate: string;
  deliveryDate: string;
}

export interface PurchaseOrderVendorInformation {
  vendorId: string;
  vendorNameSnapshot: string;
  address: string;
  attention: string | null;
  phone: string | null;
}

export interface PurchaseOrderFinancialDetails {
  paymentMode: string;
  creditLimit: number;
  currencyId: string | null;
  currencyLabelSnapshot: string | null;
  balance: number;
}

export interface PurchaseOrderDeliveryInformation {
  warehouseId: string | null;
  warehouseNameSnapshot: string | null;
  address: string;
  attention: string | null;
  phone: string | null;
}

export interface PurchaseOrderProductInformation {
  vendorProducts: string;
  ownProductsOnly: boolean;
  reference: string | null;
  mrNo: string | null;
}

export interface PurchaseOrderLineItem {
  id: string;
  purchaseOrderId: string;
  itemId: string;
  itemNameSnapshot: string;
  hsnCode: string | null;
  quantity: number;
  unitId: string;
  unitName: string;
  rate: number;
  grossAmount: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountAmount: number;
  taxableAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  lineTotal: number;
  warehouseId: string | null;
  warehouseName: string | null;
  receivedQty: number;
}

export interface PurchaseOrderAddition {
  id: string;
  type: "Addition" | "Deduction";
  ledgerId: string | null;
  ledgerNameSnapshot: string;
  description: string | null;
  amount: number;
}

export interface PurchaseOrderFooter {
  notes: string | null;
  remarks: string | null;
  taxable: boolean;
  addition: number;
  advance: number;
  total: number;
  discount: number;
  tax: number;
  netTotal: number;
}

export interface PurchaseOrder {
  id: string;
  orderDetails: PurchaseOrderOrderDetails;
  vendorInformation: PurchaseOrderVendorInformation;
  financialDetails: PurchaseOrderFinancialDetails;
  deliveryInformation: PurchaseOrderDeliveryInformation;
  productInformation: PurchaseOrderProductInformation;
  items: PurchaseOrderLineItem[];
  additions: PurchaseOrderAddition[];
  footer: PurchaseOrderFooter;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface PurchaseOrderListItem {
  id: string;
  no: string;
  date: string;
  vendorName: string;
  netTotal: number;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface PurchaseOrderPayload {
  orderDetails: {
    voucherType: string;
    no: string;
    date: string;
    dueDate: string;
    deliveryDate: string;
  };
  vendorInformation: {
    vendorId: string;
    vendorLabel: string;
    address: string;
    attention: string | null;
    phone: string | null;
  };
  financialDetails: {
    paymentMode: string;
    creditLimit: number;
    currencyId: string | null;
    currencyLabel: string | null;
    balance: number;
  };
  deliveryInformation: {
    warehouseId: string | null;
    warehouseName: string | null;
    address: string;
    attention: string | null;
    phone: string | null;
  };
  productInformation: {
    vendorProducts: string;
    ownProductsOnly: boolean;
    reference: string | null;
    mrNo: string | null;
  };
  items: Array<{
    itemId: string;
    itemNameSnapshot: string;
    hsnCode: string | null;
    quantity: number;
    unitId: string;
    rate: number;
    discountType: "percentage" | "fixed";
    discountValue: number;
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
    warehouseId: string | null;
    receivedQty: number;
  }>;
  additions: Array<{
    type: "Addition" | "Deduction";
    ledgerId: string | null;
    ledgerName: string | null;
    description: string | null;
    amount: number;
  }>;
  footer: {
    notes: string | null;
    remarks: string | null;
    taxable: boolean;
    addition: number;
    advance: number;
  };
}

export interface PurchaseOrderListQueryParams {
  keyword?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  fromDate?: string;
  toDate?: string;
  vendorId?: string;
  status?: string;
  statuses?: string[];
}

export interface PurchaseOrderPagedList {
  items: PurchaseOrderListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const purchaseOrderApi = createApi({
  reducerPath: "purchaseOrderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/transactions/purchase-orders",
    credentials: "include",
  }),
  tagTypes: ["PurchaseOrder"],
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query<PurchaseOrderPagedList, PurchaseOrderListQueryParams | void>({
      query: (params) => {
        const { statuses, ...rest } = params ?? {};
        const base = buildQueryParams(rest) ?? {};
        if (statuses && statuses.length > 0) {
          return { url: "/", params: { ...base, statuses: statuses.join(",") } };
        }
        return { url: "/", params: base };
      },
      transformResponse: (response: ApiResponse<PurchaseOrderPagedList>) => response.data,
      providesTags: ["PurchaseOrder"],
    }),
    getPurchaseOrderById: builder.query<PurchaseOrder, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: ApiResponse<PurchaseOrder>) => response.data,
      providesTags: ["PurchaseOrder"],
    }),
    createPurchaseOrder: builder.mutation<PurchaseOrder, PurchaseOrderPayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<PurchaseOrder>) => response.data,
      invalidatesTags: ["PurchaseOrder"],
    }),
    updatePurchaseOrder: builder.mutation<PurchaseOrder, PurchaseOrderPayload & { id: string; status?: string | null }>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<PurchaseOrder>) => response.data,
      invalidatesTags: ["PurchaseOrder"],
    }),
    updatePurchaseOrderStatus: builder.mutation<PurchaseOrder, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: ApiResponse<PurchaseOrder>) => response.data,
      invalidatesTags: ["PurchaseOrder"],
    }),
    deletePurchaseOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PurchaseOrder"],
    }),
    previewPurchaseOrderPdf: builder.mutation<string, PurchaseOrderPayload>({
      query: (body) => ({
        url: "/preview-pdf",
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        },
        cache: "no-cache",
      }),
    }),
    downloadPurchaseOrderPdf: builder.mutation<string, string>({
      query: (id) => ({
        url: `/${id}/pdf`,
        method: "GET",
        responseHandler: async (response) => {
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        },
        cache: "no-cache",
      }),
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useLazyGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useLazyGetPurchaseOrderByIdQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useUpdatePurchaseOrderStatusMutation,
  useDeletePurchaseOrderMutation,
  usePreviewPurchaseOrderPdfMutation,
  useDownloadPurchaseOrderPdfMutation,
} = purchaseOrderApi;
