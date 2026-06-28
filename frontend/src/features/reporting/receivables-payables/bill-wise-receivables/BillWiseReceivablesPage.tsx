import { useState } from "react";
import { useLazySearchLookupQuery } from "@/redux/api/lookupApi";
import { useGetBillWiseReceivablesQuery } from "@/redux/api/receivablesPayablesApi";
import { LookupOption } from "@/shared/types/filtering";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import { ReportLayout } from "@/features/reporting/components";
import BillWiseTable from "../components/BillWiseTable";

const today = new Date().toISOString().split("T")[0];

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function BillWiseReceivablesPage() {
  const [asOfDate, setAsOfDate] = useState(today);
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [searchLookup] = useLazySearchLookupQuery();

  const { data, isLoading, isError } = useGetBillWiseReceivablesQuery({
    asOfDate,
    customerId: customerId || undefined,
  });

  return (
    <ReportLayout>
      <ReportLayout.Breadcrumb title="Bill-wise Receivables" />

      <ReportLayout.Header className="sm:justify-end">
        <ReportLayout.Actions>
          <AutocompleteSelect<LookupOption, LookupOption[]>
            value={customerName}
            placeholder="Filter by customer"
            search={(keyword) => searchLookup({ source: "customers", keyword, limit: 10 })}
            getItems={(result) => result}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) =>
              item.secondaryLabel ? `${item.label} (${item.secondaryLabel})` : item.label
            }
            onSelect={(item) => {
              setCustomerId(item?.id ?? "");
              setCustomerName(item?.label ?? "");
            }}
            className="w-full sm:w-64"
          />
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
        <ReportLayout.Summary className="xl:grid-cols-3">
          <ReportLayout.Metric label="Invoice Amount" value={fmt(data.totals.invoiceAmount)} />
          <ReportLayout.Metric label="Paid Amount" value={fmt(data.totals.paidAmount)} />
          <ReportLayout.Metric label="Balance Outstanding" value={fmt(data.totals.balanceAmount)} />
        </ReportLayout.Summary>
      )}

      <ReportLayout.Content>
        <ReportLayout.Table>
          <BillWiseTable
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
