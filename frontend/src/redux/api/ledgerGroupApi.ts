import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PagedResponse } from "@/shared/types/filtering";

export type LedgerGroupStatus = "Active" | "Inactive";
export type LedgerGroupNature = "Asset" | "Liability" | "Income" | "Expense" | "Equity";

export interface LedgerGroup {
  id: string;
  code: string;
  name: string;
  nature: LedgerGroupNature;
  parentGroupId: string | null;
  parentGroupName: string | null;
  status: LedgerGroupStatus;
  isSystem: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LedgerGroupPayload {
  code: string;
  name: string;
  nature: LedgerGroupNature;
  parentGroupId: string | null;
  status: LedgerGroupStatus;
}

export interface LedgerGroupFilterParams {
  keyword?: string;
  nature?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export const ledgerGroupApi = createApi({
  reducerPath: "ledgerGroupApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/masters/ledger-groups",
    credentials: "include",
  }),
  tagTypes: ["LedgerGroup"],
  endpoints: (builder) => ({
    getLedgerGroups: builder.query<PagedResponse<LedgerGroup>, LedgerGroupFilterParams | void>({
      query: (params) => {
        const { page = 1, limit = 20, ...rest } = (params as LedgerGroupFilterParams) ?? {};
        return { url: "/", params: { page, limit, ...rest } };
      },
      transformResponse: (response: ApiResponse<PagedResponse<LedgerGroup>>) => response.data,
      providesTags: ["LedgerGroup"],
    }),
    createLedgerGroup: builder.mutation<LedgerGroup, LedgerGroupPayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<LedgerGroup>) => response.data,
      invalidatesTags: ["LedgerGroup"],
    }),
    updateLedgerGroup: builder.mutation<LedgerGroup, LedgerGroupPayload & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<LedgerGroup>) => response.data,
      invalidatesTags: ["LedgerGroup"],
    }),
    deleteLedgerGroup: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LedgerGroup"],
    }),
  }),
});

export const {
  useGetLedgerGroupsQuery,
  useLazyGetLedgerGroupsQuery,
  useCreateLedgerGroupMutation,
  useUpdateLedgerGroupMutation,
  useDeleteLedgerGroupMutation,
} = ledgerGroupApi;
