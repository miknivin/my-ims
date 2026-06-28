import { useState } from "react";
import { useGetBalanceSheetQuery } from "@/redux/api/financialStatementsApi";
import DateRangePicker, { DateRangeValue } from "@/shared/components/form/DateRangePicker";
import { ReportLayout } from "@/features/reporting/components";
import BalanceSheetStatement from "./BalanceSheetStatement";

const today = new Date();
const DEFAULT_FROM = `${today.getFullYear()}-01-01`;
const DEFAULT_TO   = today.toISOString().split("T")[0];

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function BalanceSheetPage() {
  // fromDate = fiscal year start for P&L component; toDate = as-of date for BS position
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    fromDate: DEFAULT_FROM,
    toDate: DEFAULT_TO,
  });

  const { data, isLoading, isError } = useGetBalanceSheetQuery({
    fromDate: dateRange.fromDate || undefined,
    asOfDate: dateRange.toDate || undefined,
  });

  const totalEquitySide = data
    ? data.totalLiabilities + data.totalEquity + data.netProfit
    : 0;

  return (
    <ReportLayout>
      <ReportLayout.Breadcrumb title="Balance Sheet" />

      <ReportLayout.Header>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            As of:{" "}
          </span>
          {dateRange.toDate || "—"}
          <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Period from:{" "}
          </span>
          {dateRange.fromDate || "—"}
        </div>
        <ReportLayout.Actions>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-full sm:w-80"
          />
        </ReportLayout.Actions>
      </ReportLayout.Header>

      {data && (
        <ReportLayout.Summary className="xl:grid-cols-4">
          <ReportLayout.Metric
            label="Total Assets"
            value={fmt(data.totalAssets)}
          />
          <ReportLayout.Metric
            label="Total Liabilities"
            value={fmt(data.totalLiabilities)}
          />
          <ReportLayout.Metric
            label="Total Equity"
            value={fmt(data.totalEquity)}
          />
          <ReportLayout.Metric
            label={data.netProfit >= 0 ? "Net Profit" : "Net Loss"}
            value={fmt(Math.abs(data.netProfit))}
            hint={
              Math.abs(data.totalAssets - totalEquitySide) < 0.01
                ? "Sheet balances ✓"
                : "⚠ Out of balance"
            }
          />
        </ReportLayout.Summary>
      )}

      <ReportLayout.Content>
        {isLoading ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Loading…
          </div>
        ) : isError ? (
          <ReportLayout.EmptyState
            title="Failed to load"
            description="Unable to fetch the balance sheet. Please try again."
          />
        ) : data ? (
          <BalanceSheetStatement report={data} />
        ) : null}
      </ReportLayout.Content>
    </ReportLayout>
  );
}
