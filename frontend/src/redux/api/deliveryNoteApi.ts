import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "@/shared/types/filtering";

export type DeliveryNoteMode = "Direct" | "AgainstSalesOrder";
export type DeliveryNoteStatus = "Draft" | "Submitted" | "Cancelled";

export interface DeliveryNoteSourceReference {
  mode: DeliveryNoteMode;
  salesOrderId: string | null;
  salesOrderNo: string | null;
  directRefNo: string | null;
}

export interface DeliveryNoteDocument {
  voucherType: string;
  no: string;
  date: string;
  expectedDeliveryDate: string | null;
}

export interface DeliveryNoteCustomerInformation {
  customerId: string;
  customerNameSnapshot: string;
  address: string;
  shippingAddress: string | null;
  attention: string | null;
  phone: string | null;
}

export interface DeliveryNoteLogistics {
  transportMode: string | null;
  lrNo: string | null;
  lrDate: string | null;
  vehicleNo: string | null;
  eWayBillNo: string | null;
  transporterName: string | null;
}

export interface DeliveryNoteGeneral {
  notes: string | null;
}

export interface DeliveryNoteLineItem {
  id: string;
  deliveryNoteId: string;
  serialNo: number;
  productId: string;
  productNameSnapshot: string;
  hsnCode: string | null;
  unitId: string;
  unitName: string;
  warehouseId: string | null;
  warehouseName: string | null;
  rate: number;
  quantity: number;
  grossAmount: number;
  discountAmount: number;
  taxableAmount: number;
  total: number;
  remark: string | null;
  salesOrderLineId: string | null;
}

export interface DeliveryNoteFooter {
  totalQty: number;
  totalAmount: number;
  netTotal: number;
}

export interface DeliveryNote {
  id: string;
  sourceRef: DeliveryNoteSourceReference;
  document: DeliveryNoteDocument;
  customerInformation: DeliveryNoteCustomerInformation;
  logistics: DeliveryNoteLogistics;
  general: DeliveryNoteGeneral;
  items: DeliveryNoteLineItem[];
  footer: DeliveryNoteFooter;
  status: DeliveryNoteStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface DeliveryNoteListItem {
  id: string;
  no: string;
  date: string;
  customerName: string;
  netTotal: number;
  status: DeliveryNoteStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface DeliveryNotePayload {
  status?: string | null;
  sourceRef: {
    mode: DeliveryNoteMode;
    salesOrderId: string | null;
    salesOrderNo: string | null;
    directRefNo: string | null;
  };
  document: {
    voucherType: string;
    no: string;
    date: string;
    expectedDeliveryDate: string | null;
  };
  customerInformation: {
    customerId: string;
    customerNameSnapshot: string;
    address: string;
    shippingAddress: string | null;
    attention: string | null;
    phone: string | null;
  };
  logistics: {
    transportMode: string | null;
    lrNo: string | null;
    lrDate: string | null;
    vehicleNo: string | null;
    eWayBillNo: string | null;
    transporterName: string | null;
  };
  general: {
    notes: string | null;
  };
  items: Array<{
    serialNo: number;
    productId: string;
    productNameSnapshot: string | null;
    hsnCode: string | null;
    unitId: string;
    warehouseId: string | null;
    rate: number;
    quantity: number;
    discountPercent: number;
    remark: string | null;
    salesOrderLineId: string | null;
  }>;
  footer: Record<string, never>;
}

export const deliveryNoteApi = createApi({
  reducerPath: "deliveryNoteApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/inventory/delivery-notes",
    credentials: "include",
  }),
  tagTypes: ["DeliveryNote"],
  endpoints: (builder) => ({
    getDeliveryNotes: builder.query<DeliveryNoteListItem[], void>({
      query: () => "/",
      transformResponse: (response: ApiResponse<DeliveryNoteListItem[]>) =>
        response.data,
      providesTags: ["DeliveryNote"],
    }),
    getDeliveryNoteById: builder.query<DeliveryNote, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: ApiResponse<DeliveryNote>) =>
        response.data,
      providesTags: ["DeliveryNote"],
    }),
    createDeliveryNote: builder.mutation<DeliveryNote, DeliveryNotePayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<DeliveryNote>) =>
        response.data,
      invalidatesTags: ["DeliveryNote"],
    }),
    updateDeliveryNote: builder.mutation<DeliveryNote, DeliveryNotePayload & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<DeliveryNote>) => response.data,
      invalidatesTags: ["DeliveryNote"],
    }),
    updateDeliveryNoteStatus: builder.mutation<
      DeliveryNote,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: ApiResponse<DeliveryNote>) =>
        response.data,
      invalidatesTags: ["DeliveryNote"],
    }),
    previewDeliveryNotePdf: builder.mutation<string, DeliveryNotePayload>({
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
    downloadDeliveryNotePdf: builder.mutation<string, string>({
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
  useGetDeliveryNotesQuery,
  useLazyGetDeliveryNotesQuery,
  useGetDeliveryNoteByIdQuery,
  useLazyGetDeliveryNoteByIdQuery,
  useCreateDeliveryNoteMutation,
  useUpdateDeliveryNoteMutation,
  useUpdateDeliveryNoteStatusMutation,
  usePreviewDeliveryNotePdfMutation,
  useDownloadDeliveryNotePdfMutation,
} = deliveryNoteApi;
