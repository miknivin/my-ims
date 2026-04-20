import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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

export const ledgerGroupApi = createApi({
  reducerPath: "ledgerGroupApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/masters/ledger-groups",
    credentials: "include",
  }),
  tagTypes: ["LedgerGroup"],
  endpoints: (builder) => ({
    getLedgerGroups: builder.query<LedgerGroup[], void>({
      query: () => "/",
      transformResponse: (response: ApiResponse<LedgerGroup[]>) => response.data,
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
  useCreateLedgerGroupMutation,
  useUpdateLedgerGroupMutation,
  useDeleteLedgerGroupMutation,
} = ledgerGroupApi;
