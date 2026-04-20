import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, PagedResponse } from "../../types/filtering";
import { BalanceType } from "./vendorApi";
import { buildQueryParams } from "./queryUtils";

export type CustomerStatus = "Active" | "Inactive";
export type CustomerType =
  | "Walk-in"
  | "Regular"
  | "Wholesale"
  | "Distributor"
  | "Dealer"
  | "Retail"
  | "Corporate"
  | "Government";
export type CustomerPriceLevel = "WRATE" | "RRATE" | "MRATE" | "Special";
export type CustomerTaxType = "GST" | "TDS" | "TCS" | "Other";
export type CustomerFilingFrequency = "Monthly" | "Quarterly";

export interface CustomerBasicDetails {
  code: string;
  name: string;
  alias: string | null;
  customerType: CustomerType;
  category: string | null;
}

export interface CustomerContact {
  phone: string | null;
  mobile: string | null;
  email: string | null;
  website: string | null;
}

export interface CustomerBillingAddress {
  street: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
}

export interface CustomerShippingAddress {
  id: string;
  name: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  isDefault: boolean;
}

export interface CustomerTaxDocument {
  id: string;
  taxType: CustomerTaxType;
  number: string;
  verified: boolean;
  verifiedAt: string | null;
  state: string | null;
  filingFrequency: CustomerFilingFrequency | null;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface CustomerFinancials {
  creditLimit: number | null;
  creditDays: number | null;
}

export interface CustomerSalesAndPricing {
  defaultTaxId: string | null;
  defaultTaxName: string | null;
  priceLevel: CustomerPriceLevel;
}

export interface CustomerStatusDetails {
  remarks: string | null;
}

export interface CustomerOpeningBalance {
  amount: number;
  balanceType: BalanceType;
  asOfDate: string;
}

export interface Customer {
  id: string;
  basicDetails: CustomerBasicDetails;
  ledgerId: string | null;
  ledgerCode: string | null;
  ledgerName: string | null;
  contact: CustomerContact;
  billingAddress: CustomerBillingAddress;
  shippingAddresses: CustomerShippingAddress[];
  taxDocuments: CustomerTaxDocument[];
  financials: CustomerFinancials;
  salesAndPricing: CustomerSalesAndPricing;
  statusDetails: CustomerStatusDetails;
  status: CustomerStatus;
  openingBalance: CustomerOpeningBalance | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface CustomerPayload {
  basicDetails: CustomerBasicDetails;
  ledgerId: string | null;
  contact: CustomerContact;
  billingAddress: CustomerBillingAddress;
  shippingAddresses: Array<Omit<CustomerShippingAddress, "id">>;
  taxDocuments: Array<Omit<CustomerTaxDocument, "id">>;
  financials: CustomerFinancials;
  salesAndPricing: {
    defaultTaxId: string | null;
    priceLevel: CustomerPriceLevel;
  };
  statusDetails: CustomerStatusDetails;
  status: CustomerStatus;
  openingBalance: CustomerOpeningBalance | null;
}

export interface CustomerListItem {
  id: string;
  basicDetails: CustomerBasicDetails;
  ledgerId: string | null;
  ledgerCode: string | null;
  ledgerName: string | null;
  contact: CustomerContact;
  financials: CustomerFinancials;
  salesAndPricing: CustomerSalesAndPricing;
  status: CustomerStatus;
  openingBalance: CustomerOpeningBalance | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface CustomerListQueryParams {
  keyword?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  status?: CustomerStatus;
  customerType?: CustomerType;
  priceLevel?: CustomerPriceLevel;
  ledgerId?: string;
  defaultTaxId?: string;
}

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/masters/customers",
    credentials: "include",
  }),
  tagTypes: ["Customer"],
  endpoints: (builder) => ({
    getCustomers: builder.query<PagedResponse<CustomerListItem>, CustomerListQueryParams | void>({
      query: (params) => ({
        url: "/",
        params: buildQueryParams(params ?? undefined),
      }),
      transformResponse: (response: ApiResponse<PagedResponse<CustomerListItem>>) => response.data,
      providesTags: ["Customer"],
    }),
    getCustomerById: builder.query<Customer, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: ApiResponse<Customer>) => response.data,
      providesTags: ["Customer"],
    }),
    createCustomer: builder.mutation<Customer, CustomerPayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Customer>) => response.data,
      invalidatesTags: ["Customer"],
    }),
    updateCustomer: builder.mutation<Customer, CustomerPayload & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<Customer>) => response.data,
      invalidatesTags: ["Customer"],
    }),
    deleteCustomer: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customer"],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useLazyGetCustomersQuery,
  useGetCustomerByIdQuery,
  useLazyGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerApi;
