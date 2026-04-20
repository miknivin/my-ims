import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type DiscountType = "percentage" | "fixed";
export type DiscountStatus = "Active" | "Inactive";

export interface Discount {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: DiscountType;
  value: number;
  status: DiscountStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DiscountPayload {
  code: string;
  name: string;
  description: string;
  type: DiscountType;
  value: number;
  status: DiscountStatus;
}

export const discountApi = createApi({
  reducerPath: "discountApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/masters/discounts",
    credentials: "include",
  }),
  tagTypes: ["Discount"],
  endpoints: (builder) => ({
    getDiscounts: builder.query<Discount[], void>({
      query: () => "/",
      transformResponse: (response: ApiResponse<Discount[]>) => response.data,
      providesTags: ["Discount"],
    }),
    createDiscount: builder.mutation<Discount, DiscountPayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Discount>) => response.data,
      invalidatesTags: ["Discount"],
    }),
    updateDiscount: builder.mutation<Discount, DiscountPayload & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<Discount>) => response.data,
      invalidatesTags: ["Discount"],
    }),
    deleteDiscount: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Discount"],
    }),
  }),
});

export const {
  useGetDiscountsQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
} = discountApi;
