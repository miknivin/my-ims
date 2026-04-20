import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../../types/filtering";

export type GoodsReceiptMode = "AgainstPurchaseOrder" | "Direct";
export type GoodsReceiptStatus = "Draft" | "Submitted" | "Cancelled";
export type TaxableMode = "Taxable" | "NonTaxable";

export interface GoodsReceiptSourceReference {
  mode: GoodsReceiptMode;
  purchaseOrderId: string | null;
  purchaseOrderNo: string | null;
  directLpoNo: string | null;
  directVendorInvoiceNo: string | null;
}

export interface GoodsReceiptDocument {
  voucherType: string;
  no: string;
  date: string;
  deliveryDate: string | null;
}

export interface GoodsReceiptVendorInformation {
  vendorId: string;
  vendorNameSnapshot: string;
  address: string;
  attention: string | null;
  phone: string | null;
}

export interface GoodsReceiptLogistics {
  lrService: string | null;
  lrNo: string | null;
  lrDate: string | null;
}

export interface GoodsReceiptGeneral {
  ownProductsOnly: boolean;
  taxableMode: TaxableMode;
  notes: string | null;
}

export interface GoodsReceiptLineItem {
  id: string;
  goodsReceiptNoteId: string;
  serialNo: number;
  productId: string;
  productNameSnapshot: string;
  hsnCode: string | null;
  code: string | null;
  ubc: string | null;
  unitId: string;
  unitName: string;
  warehouseId: string | null;
  warehouseName: string | null;
  fRate: number;
  rate: number;
  quantity: number;
  focQuantity: number;
  grossAmount: number;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  total: number;
  manufacturingDateUtc: string | null;
  expiryDateUtc: string | null;
  remark: string | null;
  sellingRate: number;
  purchaseOrderLineId: string | null;
}

export interface GoodsReceiptFooter {
  addition: number;
  discountFooter: number;
  roundOff: number;
  netTotal: number;
  totalQty: number;
  totalFoc: number;
  totalAmount: number;
}

export interface GoodsReceiptNote {
  id: string;
  sourceRef: GoodsReceiptSourceReference;
  document: GoodsReceiptDocument;
  vendorInformation: GoodsReceiptVendorInformation;
  logistics: GoodsReceiptLogistics;
  general: GoodsReceiptGeneral;
  items: GoodsReceiptLineItem[];
  footer: GoodsReceiptFooter;
  status: GoodsReceiptStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface GoodsReceiptNoteListItem {
  id: string;
  no: string;
  date: string;
  vendorName: string;
  netTotal: number;
  status: GoodsReceiptStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface GoodsReceiptNotePayload {
  sourceRef: {
    mode: GoodsReceiptMode;
    purchaseOrderId: string | null;
    purchaseOrderNo: string | null;
    directLpoNo: string | null;
    directVendorInvoiceNo: string | null;
  };
  document: {
    voucherType: string;
    no: string;
    date: string;
    deliveryDate: string | null;
  };
  vendorInformation: {
    vendorId: string;
    vendorNameSnapshot: string;
    address: string;
    attention: string | null;
    phone: string | null;
  };
  logistics: {
    lrService: string | null;
    lrNo: string | null;
    lrDate: string | null;
  };
  general: {
    ownProductsOnly: boolean;
    taxableMode: TaxableMode;
    notes: string | null;
  };
  items: Array<{
    serialNo: number;
    productId: string;
    productNameSnapshot: string | null;
    hsnCode: string | null;
    code: string | null;
    ubc: string | null;
    unitId: string;
    warehouseId: string | null;
    fRate: number;
    rate: number;
    quantity: number;
    focQuantity: number;
    discountPercent: number;
    manufacturingDateUtc: string | null;
    expiryDateUtc: string | null;
    remark: string | null;
    sellingRate: number;
    purchaseOrderLineId: string | null;
  }>;
  footer: {
    addition: number;
    discountFooter: number;
    roundOff: number;
  };
}

export const goodsReceiptNoteApi = createApi({
  reducerPath: "goodsReceiptNoteApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/inventory/goods-receipt-notes",
    credentials: "include",
  }),
  tagTypes: ["GoodsReceiptNote"],
  endpoints: (builder) => ({
    getGoodsReceiptNotes: builder.query<GoodsReceiptNoteListItem[], void>({
      query: () => "/",
      transformResponse: (response: ApiResponse<GoodsReceiptNoteListItem[]>) =>
        response.data,
      providesTags: ["GoodsReceiptNote"],
    }),
    getGoodsReceiptNoteById: builder.query<GoodsReceiptNote, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: ApiResponse<GoodsReceiptNote>) =>
        response.data,
      providesTags: ["GoodsReceiptNote"],
    }),
    createGoodsReceiptNote: builder.mutation<
      GoodsReceiptNote,
      GoodsReceiptNotePayload
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<GoodsReceiptNote>) =>
        response.data,
      invalidatesTags: ["GoodsReceiptNote"],
    }),
    updateGoodsReceiptNote: builder.mutation<
      GoodsReceiptNote,
      GoodsReceiptNotePayload & { id: string; status?: string | null }
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<GoodsReceiptNote>) =>
        response.data,
      invalidatesTags: ["GoodsReceiptNote"],
    }),
    deleteGoodsReceiptNote: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GoodsReceiptNote"],
    }),
  }),
});

export const {
  useGetGoodsReceiptNotesQuery,
  useGetGoodsReceiptNoteByIdQuery,
  useCreateGoodsReceiptNoteMutation,
  useUpdateGoodsReceiptNoteMutation,
  useDeleteGoodsReceiptNoteMutation,
} = goodsReceiptNoteApi;

