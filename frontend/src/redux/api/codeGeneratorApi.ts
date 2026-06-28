import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface NextCodeParams {
  entity: string;
  prefix?: string;
}

interface CodeSuggestion {
  code: string;
}

export const codeGeneratorApi = createApi({
  reducerPath: "codeGeneratorApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/utils", credentials: "include" }),
  endpoints: (builder) => ({
    getNextCode: builder.query<CodeSuggestion, NextCodeParams>({
      query: ({ entity, prefix }) => ({
        url: "/next-code",
        params: { entity, ...(prefix ? { prefix } : {}) },
      }),
      transformResponse: (response: ApiResponse<CodeSuggestion>) => response.data,
    }),
  }),
});

export const { useLazyGetNextCodeQuery } = codeGeneratorApi;
