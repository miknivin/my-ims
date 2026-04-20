import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface AuthUser {
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  employeeCode: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: string;
  department: string;
  designation?: string;
  isActive?: boolean;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user: AuthUser;
  token: string;
  expiresIn: number;
}

interface SessionResponse {
  success: boolean;
  message: string;
  user: AuthUser;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: AuthUser;
}

interface LogoutResponse {
  success: boolean;
  message: string;
  data: null;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/auth",
    credentials: "include",
  }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    getSession: builder.query<SessionResponse, void>({
      query: () => "/session",
      providesTags: ["Auth"],
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useGetSessionQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} = authApi;
