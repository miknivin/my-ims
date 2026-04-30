import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, PagedResponse } from "../../types/filtering";
import { buildQueryParams } from "./queryUtils";

export type VendorStatus = "Active" | "Inactive";
export type BalanceType = "Dr" | "Cr";

export interface VendorBasicInfo {
  code: string;
  name: string;
  under: string | null;
}

export interface VendorAddressAndContact {
  contactName: string | null;
  nameInOl: string | null;
  address: string;
  phone: string;
  mobile: string | null;
  email: string;
  web: string | null;
  fax: string | null;
}

export interface VendorCreditAndFinance {
  creditLimit: number | null;
  dueDays: number | null;
  currencyId: string | null;
  currencyCode: string | null;
  paymentTerms: string | null;
  remark: string | null;
}

export interface VendorTaxAndCompliance {
  gstin: string | null;
  tin: string | null;
}

export interface VendorBankDetails {
  bankDetails: string | null;
  accountNo: string | null;
  bankAddress: string | null;
}

export interface VendorOtherInfo {
  company: string | null;
}

export interface VendorOpeningBalance {
  amount: number;
  balanceType: BalanceType;
  asOfDate: string;
}

export interface Vendor {
  id: string;
  basicInfo: VendorBasicInfo;
  addressAndContact: VendorAddressAndContact;
  creditAndFinance: VendorCreditAndFinance;
  taxAndCompliance: VendorTaxAndCompliance;
  ledgerId: string;
  ledgerCode: string;
  ledgerName: string;
  ledgerGroupId: string;
  ledgerGroupName: string | null;
  bankDetails: VendorBankDetails;
  other: VendorOtherInfo;
  status: VendorStatus;
  openingBalance: VendorOpeningBalance | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface VendorPayload {
  basicInfo: VendorBasicInfo;
  addressAndContact: VendorAddressAndContact;
  creditAndFinance: Omit<VendorCreditAndFinance, "currencyCode">;
  taxAndCompliance: VendorTaxAndCompliance;
  ledgerGroupId: string;
  bankDetails: VendorBankDetails;
  other: VendorOtherInfo;
  status: VendorStatus;
  openingBalance: VendorOpeningBalance | null;
}

export interface VendorListItem {
  id: string;
  basicInfo: VendorBasicInfo;
  contactName: string | null;
  phone: string;
  currencyId: string | null;
  currencyCode: string | null;
  ledgerId: string;
  ledgerCode: string | null;
  ledgerName: string | null;
  ledgerGroupId: string;
  ledgerGroupName: string | null;
  status: VendorStatus;
  openingBalance: VendorOpeningBalance | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface VendorListQueryParams {
  keyword?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  status?: VendorStatus;
  ledgerId?: string;
  ledgerGroupId?: string;
  currencyId?: string;
}

export const vendorApi = createApi({
  reducerPath: "vendorApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/masters/vendors",
    credentials: "include",
  }),
  tagTypes: ["Vendor"],
  endpoints: (builder) => ({
    getVendors: builder.query<PagedResponse<VendorListItem>, VendorListQueryParams | void>({
      query: (params) => ({
        url: "/",
        params: buildQueryParams(params ?? undefined),
      }),
      transformResponse: (response: ApiResponse<PagedResponse<VendorListItem>>) => response.data,
      providesTags: ["Vendor"],
    }),
    getVendorById: builder.query<Vendor, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: ApiResponse<Vendor>) => response.data,
      providesTags: ["Vendor"],
    }),
    createVendor: builder.mutation<Vendor, VendorPayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Vendor>) => response.data,
      invalidatesTags: ["Vendor"],
    }),
    updateVendor: builder.mutation<Vendor, VendorPayload & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<Vendor>) => response.data,
      invalidatesTags: ["Vendor"],
    }),
    deleteVendor: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vendor"],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useLazyGetVendorsQuery,
  useGetVendorByIdQuery,
  useLazyGetVendorByIdQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
} = vendorApi;
