import { useMemo, useState } from "react";
import { useLazySearchLookupQuery } from "@/redux/api/lookupApi";
import { useGetJournalEntriesQuery } from "@/redux/api/journalEntryApi";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import DateRangePicker, {
  DateRangeValue,
} from "@/shared/components/form/DateRangePicker";
import PaginationControls from "@/shared/components/filtering/PaginationControls";
import Button from "@/shared/components/ui/button/Button";
import { TopDrawer } from "@/shared/components/ui/top-drawer";
import JournalEntryFilterForm, {
  JournalEntryFilterValues,
} from "./JournalEntryFilterForm";
import JournalEntryTable from "./JournalEntryTable";

const sourceOptions = ["Manual", "Auto"];
const statusOptions = ["Draft", "Posted", "Reversed"];
const sortOptions = [
  { value: "date_desc", label: "Date - newest first" },
  { value: "date", label: "Date - oldest first" },
  { value: "voucherNo", label: "Voucher no" },
  { value: "ledger", label: "Ledger" },
  { value: "debit_desc", label: "Debit - high to low" },
  { value: "credit_desc", label: "Credit - high to low" },
];

const defaultFilters: JournalEntryFilterValues = {
  keyword: "",
  fromDate: "",
  toDate: "",
  ledgerId: "",
  ledgerName: "",
  source: "",
  status: "",
  sortBy: "date_desc",
};

export default function JournalEntryListPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<JournalEntryFilterValues>(defaultFilters);
  const [draftFilters, setDraftFilters] =
    useState<JournalEntryFilterValues>(defaultFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchLookup] = useLazySearchLookupQuery();

  const { data, isLoading, isError } = useGetJournalEntriesQuery({
    keyword: appliedFilters.keyword,
    fromDate: appliedFilters.fromDate,
    toDate: appliedFilters.toDate,
    ledgerId: appliedFilters.ledgerId,
    source: appliedFilters.source,
    status: appliedFilters.status,
    sortBy: appliedFilters.sortBy,
    page,
    limit,
  });

  const activeFilterCount = useMemo(() => {
    return [
      appliedFilters.keyword,
      appliedFilters.fromDate || appliedFilters.toDate,
      appliedFilters.ledgerId,
      appliedFilters.source,
      appliedFilters.status,
    ].filter(Boolean).length;
  }, [appliedFilters]);

  const handleOpenFilters = () => {
    setDraftFilters(appliedFilters);
    setIsFilterOpen(true);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const handleDateRangeChange = (range: DateRangeValue) => {
    setAppliedFilters((current) => ({ ...current, ...range }));
    setDraftFilters((current) => ({ ...current, ...range }));
    setPage(1);
  };

  return (
    <div className="w-full space-y-5">
      <PageBreadcrumb pageTitle="Journal Entries" />

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <DateRangePicker
          value={{
            fromDate: appliedFilters.fromDate,
            toDate: appliedFilters.toDate,
          }}
          onChange={handleDateRangeChange}
          className="w-full sm:w-80"
        />
        <Button type="button" variant="outline" onClick={handleOpenFilters}>
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </Button>
      </div>

      <JournalEntryTable
        rows={data?.items ?? []}
        totals={data?.totals}
        isLoading={isLoading}
        isError={isError}
      />

      <PaginationControls
        page={data?.page ?? page}
        limit={data?.limit ?? limit}
        total={data?.total ?? 0}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />

      <TopDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Journal Entry Filters"
      >
        <JournalEntryFilterForm
          values={draftFilters}
          sourceOptions={sourceOptions}
          statusOptions={statusOptions}
          sortOptions={sortOptions}
          onChange={(values) =>
            setDraftFilters((current) => ({ ...current, ...values }))
          }
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          searchLedgers={(keyword) =>
            searchLookup({
              source: "ledgers",
              keyword,
              limit: 10,
            })
          }
        />
      </TopDrawer>
    </div>
  );
}
