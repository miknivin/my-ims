import { useState } from "react";
import { useGetCashFlowQuery } from "@/redux/api/financialStatementsApi";
import DateRangePicker, { DateRangeValue } from "@/shared/components/form/DateRangePicker";
import { ReportLayout } from "@/features/reporting/components";
import CashFlowStatement from "./CashFlowStatement";

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtSigned = (n: number) => {
  const abs = Math.abs(n);
  const s = abs.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `(${s})` : s;
};

export default function CashFlowPage() {
  const [dateRange, setDateRange] = useState<DateRangeValue>({ fromDate: "", toDate: "" });

  const skip = !dateRange.fromDate || !dateRange.toDate;

  const { data, isLoading, isError } = useGetCashFlowQuery(
    { fromDate: dateRange.fromDate, toDate: dateRange.toDate },
    { skip },
  );

  const isPositive = (data?.netCashFromOperations ?? 0) >= 0;

  return (
    <ReportLayout>
      <ReportLayout.Breadcrumb title="Cash Flow" />

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
        <ReportLayout.Summary className="xl:grid-cols-4">
          <ReportLayout.Metric
            label="Net Profit"
            value={fmt(data.netProfit)}
          />
          <ReportLayout.Metric
            label="A/R Movement"
            value={fmtSigned(data.accountsReceivableChange)}
            hint={
              data.accountsReceivableChange >= 0
                ? "Receivables reduced (cash inflow)"
                : "Receivables grew (cash tied up)"
            }
          />
          <ReportLayout.Metric
            label="A/P Movement"
            value={fmtSigned(data.accountsPayableChange)}
            hint={
              data.accountsPayableChange >= 0
                ? "Payables grew (supplier financing)"
                : "Payables reduced (cash paid out)"
            }
          />
          <ReportLayout.Metric
            label="Net Cash from Operations"
            value={fmtSigned(data.netCashFromOperations)}
            hint={isPositive ? "Net cash inflow" : "Net cash outflow"}
          />
        </ReportLayout.Summary>
      )}

      <ReportLayout.Content>
        {skip ? (
          <ReportLayout.EmptyState
            title="Select a period"
            description="Choose a date range to generate the Cash Flow statement."
          />
        ) : isLoading ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Loading…
          </div>
        ) : isError ? (
          <ReportLayout.EmptyState
            title="Failed to load"
            description="Unable to fetch the cash flow statement. Please try again."
          />
        ) : data ? (
          <CashFlowStatement report={data} />
        ) : null}
      </ReportLayout.Content>
    </ReportLayout>
  );
}
