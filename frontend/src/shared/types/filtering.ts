export interface PagedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy: string | null;
  keyword: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LookupOption {
  id: string;
  label: string;
  secondaryLabel?: string | null;
}

export type LookupSource =
  | "ledgers"
  | "currencies"
  | "taxes"
  | "categories"
  | "customers"
  | "vendors"
  | "uoms";

export interface LookupResolveItem {
  source: LookupSource;
  options: LookupOption[];
}

export interface LookupResolveRequestItem {
  source: LookupSource;
  ids: string[];
}

export interface SortOption {
  value: string;
  label: string;
}

export interface SelectFilterOption {
  value: string;
  label: string;
}
