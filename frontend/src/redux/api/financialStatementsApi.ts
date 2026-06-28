import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "@/shared/types/filtering";

// ── Trial Balance ──────────────────────────────────────────────────────────────
export interface TrialBalanceFilter {
  fromDate?: string;
  toDate?: string;
  showZeroBalances?: boolean;
}

export interface TrialBalanceRow {
  ledgerId: string;
  ledgerCode: string;
  ledgerName: string;
  groupId: string;
  groupName: string;
  nature: string;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
}

export interface TrialBalanceTotals {
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
}

export interface TrialBalanceReport {
  fromDate: string;
  toDate: string;
  totals: TrialBalanceTotals;
  rows: TrialBalanceRow[];
}

// ── Profit & Loss ──────────────────────────────────────────────────────────────
export interface ProfitAndLossFilter {
  fromDate?: string;
  toDate?: string;
}

export interface ProfitAndLossLine {
  ledgerId: string;
  ledgerCode: string;
  ledgerName: string;
  amount: number;
}

export interface ProfitAndLossGroup {
  groupId: string;
  groupName: string;
  total: number;
  lines: ProfitAndLossLine[];
}

export interface ProfitAndLossReport {
  fromDate: string;
  toDate: string;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  incomeGroups: ProfitAndLossGroup[];
  expenseGroups: ProfitAndLossGroup[];
}

// ── Balance Sheet ──────────────────────────────────────────────────────────────
export interface BalanceSheetFilter {
  fromDate?: string;
  asOfDate?: string;
}

export interface BalanceSheetLine {
  ledgerId: string;
  ledgerCode: string;
  ledgerName: string;
  balance: number;
}

export interface BalanceSheetGroup {
  groupId: string;
  groupName: string;
  total: number;
  lines: BalanceSheetLine[];
}

export interface BalanceSheetReport {
  fromDate: string;
  asOfDate: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  netProfit: number;
  assetGroups: BalanceSheetGroup[];
  liabilityGroups: BalanceSheetGroup[];
  equityGroups: BalanceSheetGroup[];
}

// ── Cash Flow ──────────────────────────────────────────────────────────────────
export interface CashFlowFilter {
  fromDate?: string;
  toDate?: string;
}

export interface CashFlowReport {
  fromDate: string;
  toDate: string;
  netProfit: number;
  accountsReceivableChange: number;
  accountsPayableChange: number;
  netCashFromOperations: number;
}

// ── API ────────────────────────────────────────────────────────────────────────
export const financialStatementsApi = createApi({
  reducerPath: "financialStatementsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/reports/financial-statements",
    credentials: "include",
  }),
  tagTypes: ["TrialBalance", "ProfitAndLoss", "BalanceSheet", "CashFlow"],
  endpoints: (builder) => ({
    getTrialBalance: builder.query<TrialBalanceReport, TrialBalanceFilter>({
      query: ({ fromDate, toDate, showZeroBalances }) => ({
        url: "/trial-balance",
        params: {
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          showZeroBalances: showZeroBalances || undefined,
        },
      }),
      transformResponse: (r: ApiResponse<TrialBalanceReport>) => r.data,
      providesTags: ["TrialBalance"],
    }),
    getProfitAndLoss: builder.query<ProfitAndLossReport, ProfitAndLossFilter>({
      query: ({ fromDate, toDate }) => ({
        url: "/profit-and-loss",
        params: {
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        },
      }),
      transformResponse: (r: ApiResponse<ProfitAndLossReport>) => r.data,
      providesTags: ["ProfitAndLoss"],
    }),
    getBalanceSheet: builder.query<BalanceSheetReport, BalanceSheetFilter>({
      query: ({ fromDate, asOfDate }) => ({
        url: "/balance-sheet",
        params: {
          fromDate: fromDate || undefined,
          asOfDate: asOfDate || undefined,
        },
      }),
      transformResponse: (r: ApiResponse<BalanceSheetReport>) => r.data,
      providesTags: ["BalanceSheet"],
    }),
    getCashFlow: builder.query<CashFlowReport, CashFlowFilter>({
      query: ({ fromDate, toDate }) => ({
        url: "/cash-flow",
        params: {
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        },
      }),
      transformResponse: (r: ApiResponse<CashFlowReport>) => r.data,
      providesTags: ["CashFlow"],
    }),
  }),
});

export const {
  useGetTrialBalanceQuery,
  useGetProfitAndLossQuery,
  useGetBalanceSheetQuery,
  useGetCashFlowQuery,
} = financialStatementsApi;
