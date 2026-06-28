import { useState } from "react";
import { useGetProfitAndLossQuery } from "@/redux/api/financialStatementsApi";
import DateRangePicker, { DateRangeValue } from "@/shared/components/form/DateRangePicker";
import { ReportLayout } from "@/features/reporting/components";
import ProfitAndLossStatement from "./ProfitAndLossStatement";

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ProfitAndLossPage() {
  const [dateRange, setDateRange] = useState<DateRangeValue>({ fromDate: "", toDate: "" });

  const skip = !dateRange.fromDate || !dateRange.toDate;

  const { data, isLoading, isError } = useGetProfitAndLossQuery(
    { fromDate: dateRange.fromDate, toDate: dateRange.toDate },
    { skip },
  );

  const isProfit = (data?.netProfit ?? 0) >= 0;

  return (
    <ReportLayout>
      <ReportLayout.Breadcrumb title="Profit & Loss" />

      <ReportLayout.Header className="sm:justify-end">
        <ReportLayout.Actions>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-full sm:w-80"
          />
        </ReportLayout.Actions>
      </ReportLayout.Header>

      {data && !skip && (
        <ReportLayout.Summary className="xl:grid-cols-3">
          <ReportLayout.Metric
            label="Total Income"
            value={fmt(data.totalIncome)}
          />
          <ReportLayout.Metric
            label="Total Expenditure"
            value={fmt(data.totalExpense)}
          />
          <ReportLayout.Metric
            label={isProfit ? "Net Profit" : "Net Loss"}
            value={fmt(Math.abs(data.netProfit))}
            hint={isProfit ? "Profitable period" : "Loss-making period"}
          />
        </ReportLayout.Summary>
      )}

      <ReportLayout.Content>
        {skip ? (
          <ReportLayout.EmptyState
            title="Select a period"
            description="Choose a date range to generate the Profit &amp; Loss statement."
          />
        ) : isLoading ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Loading…
          </div>
        ) : isError ? (
          <ReportLayout.EmptyState
            title="Failed to load"
            description="Unable to fetch the P&L statement. Please try again."
          />
        ) : data ? (
          <ProfitAndLossStatement report={data} />
        ) : null}
      </ReportLayout.Content>
    </ReportLayout>
  );
}
