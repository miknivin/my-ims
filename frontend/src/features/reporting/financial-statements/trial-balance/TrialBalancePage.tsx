import { useState } from "react";
import { useSearchParams } from "react-router";
import { useGetTrialBalanceQuery } from "@/redux/api/financialStatementsApi";
import DateRangePicker, { DateRangeValue } from "@/shared/components/form/DateRangePicker";
import Button from "@/shared/components/ui/button/Button";
import { TopDrawer } from "@/shared/components/ui/top-drawer";
import { ReportLayout } from "@/features/reporting/components";
import TrialBalanceFilterForm, {
  TrialBalanceFilterValues,
} from "./TrialBalanceFilterForm";
import TrialBalanceTable from "./TrialBalanceTable";

const defaultFilters: TrialBalanceFilterValues = {
  fromDate: "",
  toDate: "",
  showZeroBalances: false,
};

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function filtersFromParams(params: URLSearchParams): TrialBalanceFilterValues {
  return {
    fromDate: params.get("fromDate") ?? "",
    toDate: params.get("toDate") ?? "",
    showZeroBalances: params.get("showZeroBalances") === "true",
  };
}

function filtersToParams(f: TrialBalanceFilterValues): URLSearchParams {
  const p = new URLSearchParams();
  if (f.fromDate) p.set("fromDate", f.fromDate);
  if (f.toDate) p.set("toDate", f.toDate);
  if (f.showZeroBalances) p.set("showZeroBalances", "true");
  return p;
}

export default function TrialBalancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [appliedFilters, setAppliedFilters] = useState<TrialBalanceFilterValues>(
    () => filtersFromParams(searchParams),
  );
  const [draftFilters, setDraftFilters] = useState<TrialBalanceFilterValues>(appliedFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const skip = !appliedFilters.fromDate || !appliedFilters.toDate;

  const { data, isLoading, isError } = useGetTrialBalanceQuery(
    {
      fromDate: appliedFilters.fromDate,
      toDate: appliedFilters.toDate,
      showZeroBalances: appliedFilters.showZeroBalances || undefined,
    },
    { skip },
  );

  const totals = data?.totals;

  const commit = (next: TrialBalanceFilterValues) => {
    setAppliedFilters(next);
    setSearchParams(filtersToParams(next), { replace: true });
  };

  const handleDateRangeChange = (range: DateRangeValue) => {
    const next = { ...appliedFilters, ...range };
    setDraftFilters((c) => ({ ...c, ...range }));
    commit(next);
  };

  const handleApplyFilters = () => {
    commit(draftFilters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setDraftFilters(defaultFilters);
    commit(defaultFilters);
    setIsFilterOpen(false);
  };

  return (
    <ReportLayout>
      <ReportLayout.Breadcrumb title="Trial Balance" />

      <ReportLayout.Header className="sm:justify-end">
        <ReportLayout.Actions>
          <DateRangePicker
            value={{ fromDate: appliedFilters.fromDate, toDate: appliedFilters.toDate }}
            onChange={handleDateRangeChange}
            className="w-full sm:w-80"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDraftFilters(appliedFilters);
              setIsFilterOpen(true);
            }}
          >
            Filters{appliedFilters.showZeroBalances ? " (1)" : ""}
          </Button>
        </ReportLayout.Actions>
      </ReportLayout.Header>

      {totals && !skip && (
        <ReportLayout.Summary className="xl:grid-cols-3">
          <ReportLayout.Metric
            label="Closing Debit Total"
            value={fmt(totals.closingDebit)}
          />
          <ReportLayout.Metric
            label="Closing Credit Total"
            value={fmt(totals.closingCredit)}
          />
          <ReportLayout.Metric
            label="Difference (Dr − Cr)"
            value={fmt(totals.closingDebit - totals.closingCredit)}
            hint={
              Math.abs(totals.closingDebit - totals.closingCredit) < 0.01
                ? "Balanced ✓"
                : "Out of balance — check entries"
            }
          />
        </ReportLayout.Summary>
      )}

      <ReportLayout.Content>
        <ReportLayout.Table>
          <TrialBalanceTable
            rows={skip ? [] : (data?.rows ?? [])}
            totals={skip ? undefined : totals}
            isLoading={!skip && isLoading}
            isError={!skip && isError}
          />
        </ReportLayout.Table>
      </ReportLayout.Content>

      <TopDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Trial Balance Filters"
      >
        <TrialBalanceFilterForm
          values={draftFilters}
          onChange={(v) => {
            const next = { ...draftFilters, ...v };
            setDraftFilters(next);
            if ("fromDate" in v || "toDate" in v) {
              commit({ ...appliedFilters, fromDate: next.fromDate, toDate: next.toDate });
            }
          }}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      </TopDrawer>
    </ReportLayout>
  );
}
