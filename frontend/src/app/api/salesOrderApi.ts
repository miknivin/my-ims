import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../../types/filtering";
import { buildQueryParams } from "./queryUtils";

export interface SalesOrderOrderDetails {
  voucherType: "SL" | "PH";
  no: string;
  date: string;
  deliveryDate: string | null;
}

export interface SalesOrderPartyInformation {
  customerId: string;
  customerNameSnapshot: string;
  customerCodeSnapshot: string | null;
  address: string | null;
  attention: string | null;
}

export interface SalesOrderCommercialDetails {
  rateLevel: "WRATE" | "RRATE" | "MRATE";
  currencyId: string | null;
  currencyCodeSnapshot: string | null;
  currencySymbolSnapshot: string | null;
  creditLimit: number | null;
  isInterState: boolean;
  taxApplication: "After Discount" | "Before Discount";
}

export interface SalesOrderSalesDetails {
  salesManId: string | null;
  salesManNameSnapshot: string | null;
}

export interface SalesOrderLineItem {
  id: string;
  salesOrderId: string;
  sno: number;
  productId: string;
  productNameSnapshot: string;
  hsnCode: string | null;
  unitId: string;
  unitName: string;
  quantity: number;
  foc: number;
  mrp: number;
  rate: number;
  grossAmount: number;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  taxPercent: number;
  taxAmount: number;
  netAmount: number;
  warehouseId: string | null;
  warehouseName: string | null;
}

export interface SalesOrderAddition {
  id: string;
  type: "Addition" | "Deduction";
  ledgerId: string | null;
  ledgerNameSnapshot: string;
  description: string | null;
  amount: number;
}

export interface SalesOrderFooter {
  vehicleNo: string | null;
  total: number;
  discount: number;
  freight: number;
  soAdvance: number;
  roundOff: number;
  netTotal: number;
  balance: number;
  remarks: string | null;
}

export interface SalesOrder {
  id: string;
  orderDetails: SalesOrderOrderDetails;
  partyInformation: SalesOrderPartyInformation;
  commercialDetails: SalesOrderCommercialDetails;
  salesDetails: SalesOrderSalesDetails;
  items: SalesOrderLineItem[];
  additions: SalesOrderAddition[];
  footer: SalesOrderFooter;
  status: string;
  createdById: string;
  updatedById: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface SalesOrderListItem {
  id: string;
  no: string;
  date: string;
  customerName: string;
  netTotal: number;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface SalesOrderPayload {
  orderDetails: {
    voucherType: "SL" | "PH";
    no: string;
    date: string;
    deliveryDate: string | null;
  };
  partyInformation: {
    customerId: string;
    customerName: string;
    customerCode: string | null;
    address: string | null;
    attention: string | null;
  };
  commercialDetails: {
    rateLevel: "WRATE" | "RRATE" | "MRATE";
    currencyId: string | null;
    currencyCode: string | null;
    currencySymbol: string | null;
    creditLimit: number | null;
    isInterState: boolean;
    taxApplication: "After Discount" | "Before Discount";
  };
  salesDetails: {
    salesManId: string | null;
    salesMan: string | null;
  };
  items: Array<{
    sno: number;
    productId: string;
    productNameSnapshot: string;
    hsnCode: string | null;
    unitId: string;
    quantity: number;
    foc: number;
    mrp: number;
    rate: number;
    grossAmount: number;
    discountPercent: number;
    discountAmount: number;
    taxableAmount: number;
    taxPercent: number;
    taxAmount: number;
    netAmount: number;
    warehouseId: string | null;
  }>;
  additions: Array<{
    type: "Addition" | "Deduction";
    ledgerId: string | null;
    ledgerName: string | null;
    description: string | null;
    amount: number;
  }>;
  footer: {
    vehicleNo: string | null;
    total: number;
    discount: number;
    freight: number;
    soAdvance: number;
    roundOff: number;
    netTotal: number;
    balance: number;
    remarks: string | null;
  };
}

export interface SalesOrderListQueryParams {
  keyword?: string;
  limit?: number;
}

export const salesOrderApi = createApi({
  reducerPath: "salesOrderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/transactions/sales-orders",
    credentials: "include",
  }),
  tagTypes: ["SalesOrder"],
  endpoints: (builder) => ({
    getSalesOrders: builder.query<SalesOrderListItem[], SalesOrderListQueryParams | void>({
      query: (params) => ({
        url: "/",
        params: buildQueryParams(params ?? undefined),
      }),
      transformResponse: (response: ApiResponse<SalesOrderListItem[]>) => response.data,
      providesTags: ["SalesOrder"],
    }),
    getSalesOrderById: builder.query<SalesOrder, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: ApiResponse<SalesOrder>) => response.data,
      providesTags: ["SalesOrder"],
    }),
    createSalesOrder: builder.mutation<SalesOrder, SalesOrderPayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<SalesOrder>) => response.data,
      invalidatesTags: ["SalesOrder"],
    }),
    updateSalesOrder: builder.mutation<SalesOrder, SalesOrderPayload & { id: string; status?: string | null }>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<SalesOrder>) => response.data,
      invalidatesTags: ["SalesOrder"],
    }),
    deleteSalesOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SalesOrder"],
    }),
  }),
});

export const {
  useGetSalesOrdersQuery,
  useLazyGetSalesOrdersQuery,
  useGetSalesOrderByIdQuery,
  useLazyGetSalesOrderByIdQuery,
  useCreateSalesOrderMutation,
  useUpdateSalesOrderMutation,
  useDeleteSalesOrderMutation,
} = salesOrderApi;
