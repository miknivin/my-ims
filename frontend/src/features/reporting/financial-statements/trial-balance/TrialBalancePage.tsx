import { useState } from "react";
import { useGetTrialBalanceQuery } from "@/redux/api/financialStatementsApi";
import DateRangePicker, { DateRangeValue } from "@/shared/components/form/DateRangePicker";
import Button from "@/shared/components/ui/button/Button";
import { TopDrawer } from "@/shared/components/ui/top-drawer";
import { ReportLayout } from "@/features/reporting/components";
import TrialBalanceFilterForm, {
  TrialBalanceFilterValues,
} from "./TrialBalanceFilterForm";
import TrialBalanceTable from "./TrialBalanceTable";

const defaultFilters: TrialBalanceFilterValues = { showZeroBalances: false };

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function TrialBalancePage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeValue>({ fromDate: "", toDate: "" });
  const [appliedFilters, setAppliedFilters] = useState<TrialBalanceFilterValues>(defaultFilters);
  const [draftFilters, setDraftFilters] = useState<TrialBalanceFilterValues>(defaultFilters);

  const skip = !dateRange.fromDate || !dateRange.toDate;

  const { data, isLoading, isError } = useGetTrialBalanceQuery(
    {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      showZeroBalances: appliedFilters.showZeroBalances || undefined,
    },
    { skip },
  );

  const totals = data?.totals;

  const handleDateChange = (range: DateRangeValue) => setDateRange(range);

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setIsFilterOpen(false);
  };

  return (
    <ReportLayout>
      <ReportLayout.Breadcrumb title="Trial Balance" />

      <ReportLayout.Header className="sm:justify-end">
        <ReportLayout.Actions>
          <DateRangePicker
            value={dateRange}
            onChange={handleDateChange}
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
          onChange={(v) => setDraftFilters((c) => ({ ...c, ...v }))}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      </TopDrawer>
    </ReportLayout>
  );
}
