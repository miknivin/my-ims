import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, PagedResponse } from "../../types/filtering";
import { buildQueryParams } from "./queryUtils";

export type ProductStatus = "Active" | "Inactive";

export interface ProductBasicInfo {
  code: string;
  name: string;
  otherLanguage: string | null;
  taxId: string | null;
  taxName: string | null;
}

export interface ProductPricingAndRates {
  profitPercentage: number | null;
  purchaseRate: number | null;
  cost: number | null;
  salesRate: number | null;
  normalRate: number | null;
  mrp: number | null;
  wholesaleRate: number | null;
}

export interface ProductStockAndMeasurement {
  hsn: string | null;
  baseUomId: string;
  baseUomName: string;
  purchaseUomId: string;
  purchaseUomName: string;
  salesUomId: string;
  salesUomName: string;
  stockUomId: string;
  stockUomName: string;
  minimumStock: number | null;
  maximumStock: number | null;
  reOrderLevel: number | null;
  reOrderQuantity: number | null;
}

export interface ProductGeneralSettings {
  inactive: boolean;
  lessProfit: boolean;
  counterItem: boolean;
  autoEntry: boolean;
  hideFromDevice: boolean;
  expiryDays: number;
  taxInclusive: boolean;
  serialNo: boolean;
}

export interface ProductCategorization {
  groupCategoryId: string | null;
  groupCategoryName: string | null;
  subGroupCategoryId: string | null;
  subGroupCategoryName: string | null;
  vendorId: string | null;
  vendorName: string | null;
  brand: string | null;
}

export interface ProductProperties {
  generalSettings: ProductGeneralSettings;
  categorization: ProductCategorization;
}

export interface ProductAdditionalDetails {
  packUnit: number | null;
  additionPercentage: number | null;
  addition: number | null;
  company: string | null;
  warehouseStock: string | null;
  document: string | null;
  barcode: string | null;
  purchaseHistory: string | null;
  salesHistory: string | null;
  companyStock: string | null;
}

export interface ProductOpeningStock {
  quantity: number;
  asOfDate: string;
}

export interface Product {
  id: string;
  basicInfo: ProductBasicInfo;
  pricingAndRates: ProductPricingAndRates;
  stockAndMeasurement: ProductStockAndMeasurement;
  properties: ProductProperties;
  additionalDetails: ProductAdditionalDetails;
  status: ProductStatus;
  openingStock: ProductOpeningStock | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface ProductPayload {
  basicInfo: Omit<ProductBasicInfo, "taxName">;
  pricingAndRates: ProductPricingAndRates;
  stockAndMeasurement: Omit<ProductStockAndMeasurement, "baseUomName" | "purchaseUomName" | "salesUomName" | "stockUomName">;
  properties: {
    generalSettings: ProductGeneralSettings;
    categorization: Omit<ProductCategorization, "groupCategoryName" | "subGroupCategoryName" | "vendorName">;
  };
  additionalDetails: ProductAdditionalDetails;
  status: ProductStatus;
  openingStock: ProductOpeningStock | null;
}

export interface ProductListItem {
  id: string;
  basicInfo: ProductBasicInfo;
  stockAndMeasurement: ProductStockAndMeasurement;
  categorization: ProductCategorization;
  status: ProductStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface ProductListQueryParams {
  keyword?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  status?: ProductStatus;
  taxId?: string;
  baseUomId?: string;
  groupCategoryId?: string;
  subGroupCategoryId?: string;
  vendorId?: string;
}

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/masters/products",
    credentials: "include",
  }),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getProducts: builder.query<PagedResponse<ProductListItem>, ProductListQueryParams | void>({
      query: (params) => ({
        url: "/",
        params: buildQueryParams(params ?? undefined),
      }),
      transformResponse: (response: ApiResponse<PagedResponse<ProductListItem>>) => response.data,
      providesTags: ["Product"],
    }),
    getProductById: builder.query<Product, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: ApiResponse<Product>) => response.data,
      providesTags: ["Product"],
    }),
    createProduct: builder.mutation<Product, ProductPayload>({
      query: (body) => ({ url: "/", method: "POST", body }),
      transformResponse: (response: ApiResponse<Product>) => response.data,
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<Product, ProductPayload & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/${id}`, method: "PUT", body }),
      transformResponse: (response: ApiResponse<Product>) => response.data,
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useLazyGetProductsQuery,
  useGetProductByIdQuery,
  useLazyGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
