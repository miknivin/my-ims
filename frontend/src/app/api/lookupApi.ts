import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ApiResponse,
  LookupOption,
  LookupResolveItem,
  LookupResolveRequestItem,
  LookupSource,
} from "../../types/filtering";

interface LookupSearchParams {
  source: LookupSource;
  keyword: string;
  limit?: number;
}

interface LookupResolveRequest {
  items: LookupResolveRequestItem[];
}

export const lookupApi = createApi({
  reducerPath: "lookupApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/lookups",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    searchLookup: builder.query<LookupOption[], LookupSearchParams>({
      query: ({ source, keyword, limit = 10 }) => ({
        url: `/${source}`,
        params: {
          keyword,
          limit,
        },
      }),
      transformResponse: (response: ApiResponse<LookupOption[]>) => response.data,
    }),
    resolveLookups: builder.query<LookupResolveItem[], LookupResolveRequest>({
      query: (body) => ({
        url: "/resolve",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<LookupResolveItem[]>) => response.data,
    }),
  }),
});

export const {
  useSearchLookupQuery,
  useLazySearchLookupQuery,
  useResolveLookupsQuery,
} = lookupApi;
