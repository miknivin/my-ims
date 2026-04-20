import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type CategoryStatus = "Active" | "Inactive";

export interface Category {
  id: string;
  code: string;
  name: string;
  parentCategoryId: string | null;
  parentCategoryName: string | null;
  status: CategoryStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CategoryPayload {
  code: string;
  name: string;
  parentCategoryId: string | null;
  status: CategoryStatus;
}

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/masters/categories",
    credentials: "include",
  }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => "/",
      transformResponse: (response: ApiResponse<Category[]>) => response.data,
      providesTags: ["Category"],
    }),
    createCategory: builder.mutation<Category, CategoryPayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Category>) => response.data,
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation<Category, CategoryPayload & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<Category>) => response.data,
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
