import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type RolePermissions = Record<string, string[]>;

export interface RoleListItem {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: RolePermissions;
}

export interface CreateRolePayload {
  name: string;
  permissions: RolePermissions;
}

export interface UpdateRolePayload {
  name: string;
  permissions: RolePermissions;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const roleApi = createApi({
  reducerPath: "roleApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api", credentials: "include" }),
  tagTypes: ["Role"],
  endpoints: (builder) => ({
    getRoles: builder.query<RoleListItem[], void>({
      query: () => "/roles",
      transformResponse: (res: ApiResponse<RoleListItem[]>) => res.data,
      providesTags: ["Role"],
    }),
    getRoleById: builder.query<Role, string>({
      query: (id) => `/roles/${id}`,
      transformResponse: (res: ApiResponse<Role>) => res.data,
      providesTags: (_result, _err, id) => [{ type: "Role", id }],
    }),
    createRole: builder.mutation<Role, CreateRolePayload>({
      query: (body) => ({ url: "/roles", method: "POST", body }),
      transformResponse: (res: ApiResponse<Role>) => res.data,
      invalidatesTags: ["Role"],
    }),
    updateRole: builder.mutation<Role, { id: string } & UpdateRolePayload>({
      query: ({ id, ...body }) => ({ url: `/roles/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<Role>) => res.data,
      invalidatesTags: ["Role"],
    }),
    deleteRole: builder.mutation<void, string>({
      query: (id) => ({ url: `/roles/${id}`, method: "DELETE" }),
      invalidatesTags: ["Role"],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useLazyGetRoleByIdQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApi;
