import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { buildQueryParams } from "./queryUtils";

export type UomStatus = "Active" | "Inactive";

export interface Uom {
  id: string;
  code: string;
  name: string;
  status: UomStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface UomPayload {
  code: string;
  name: string;
  status: UomStatus;
}

export interface UomListQueryParams {
  keyword?: string;
  limit?: number;
}

export const uomApi = createApi({
  reducerPath: "uomApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/masters/uoms",
    credentials: "include",
  }),
  tagTypes: ["Uom"],
  endpoints: (builder) => ({
    getUoms: builder.query<Uom[], UomListQueryParams | void>({
      query: (params) => ({
        url: "/",
        params: buildQueryParams(params ?? undefined),
      }),
      transformResponse: (response: ApiResponse<Uom[]>) => response.data,
      providesTags: ["Uom"],
    }),
    createUom: builder.mutation<Uom, UomPayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Uom>) => response.data,
      invalidatesTags: ["Uom"],
    }),
    updateUom: builder.mutation<Uom, UomPayload & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<Uom>) => response.data,
      invalidatesTags: ["Uom"],
    }),
    deleteUom: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Uom"],
    }),
  }),
});

export const {
  useGetUomsQuery,
  useLazyGetUomsQuery,
  useCreateUomMutation,
  useUpdateUomMutation,
  useDeleteUomMutation,
} = uomApi;
