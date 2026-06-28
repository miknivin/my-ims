import { useState } from "react";
import { useGetReceivablesAgeingQuery } from "@/redux/api/receivablesPayablesApi";
import { ReportLayout } from "@/features/reporting/components";
import AgeingTable from "../components/AgeingTable";

const today = new Date().toISOString().split("T")[0];

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ReceivablesAgeingPage() {
  const [asOfDate, setAsOfDate] = useState(today);
  const { data, isLoading, isError } = useGetReceivablesAgeingQuery({ asOfDate });

  return (
    <ReportLayout>
      <ReportLayout.Breadcrumb title="Receivables Ageing" />

      <ReportLayout.Header className="sm:justify-end">
        <ReportLayout.Actions>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            As of
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </label>
        </ReportLayout.Actions>
      </ReportLayout.Header>

      {data && (
        <ReportLayout.Summary className="xl:grid-cols-5">
          <ReportLayout.Metric label="Current" value={fmt(data.totals.current)} />
          <ReportLayout.Metric label="1–30 Days" value={fmt(data.totals.days1To30)} />
          <ReportLayout.Metric
            label="31–90 Days"
            value={fmt(data.totals.days31To60 + data.totals.days61To90)}
          />
          <ReportLayout.Metric
            label="90+ Days"
            value={fmt(data.totals.over90)}
            hint={data.totals.over90 > 0 ? "Critical — escalate collections" : undefined}
          />
          <ReportLayout.Metric label="Total Outstanding" value={fmt(data.totals.total)} />
        </ReportLayout.Summary>
      )}

      <ReportLayout.Content>
        <ReportLayout.Table>
          <AgeingTable
            rows={data?.rows ?? []}
            totals={data?.totals}
            partyLabel="Customer"
            isLoading={isLoading}
            isError={isError}
          />
        </ReportLayout.Table>
      </ReportLayout.Content>
    </ReportLayout>
  );
}
