import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface UserListItem {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  department: string;
  designation: string;
  isActive: boolean;
}

export interface CreateUserPayload {
  employeeCode: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: string;
  department: string;
  designation: string;
  isActive: boolean;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  mobile: string;
  role: string;
  department: string;
  designation: string;
  isActive: boolean;
  password?: string;
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api", credentials: "include" }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUsers: builder.query<UserListItem[], void>({
      query: () => "/users",
      transformResponse: (res: ApiResponse<UserListItem[]>) => res.data,
      providesTags: ["User"],
    }),
    createUser: builder.mutation<UserListItem, CreateUserPayload>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      transformResponse: (res: ApiResponse<UserListItem>) => res.data,
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation<UserListItem, { id: string } & UpdateUserPayload>({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<UserListItem>) => res.data,
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
