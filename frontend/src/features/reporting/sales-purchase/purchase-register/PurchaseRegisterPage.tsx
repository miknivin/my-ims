import { useMemo, useState } from "react";
import { useLazySearchLookupQuery } from "@/redux/api/lookupApi";
import { useGetPurchaseRegisterQuery } from "@/redux/api/purchaseRegisterReportApi";
import DateRangePicker, {
  DateRangeValue,
} from "@/shared/components/form/DateRangePicker";
import PaginationControls from "@/shared/components/filtering/PaginationControls";
import Button from "@/shared/components/ui/button/Button";
import { TopDrawer } from "@/shared/components/ui/top-drawer";
import { ReportLayout } from "@/features/reporting/components";
import PurchaseRegisterFilterForm, {
  PurchaseRegisterFilterValues,
} from "./PurchaseRegisterFilterForm";
import PurchaseRegisterTable from "./PurchaseRegisterTable";

const statusOptions = ["Draft", "Submitted", "Cancelled"];
const sortOptions = [
  { value: "date_desc", label: "Date - newest first" },
  { value: "date", label: "Date - oldest first" },
  { value: "invoiceNo", label: "Invoice no" },
  { value: "vendor", label: "Vendor" },
  { value: "netAmount_desc", label: "Net amount - high to low" },
  { value: "outstanding_desc", label: "Outstanding - high to low" },
];

const defaultFilters: PurchaseRegisterFilterValues = {
  keyword: "",
  fromDate: "",
  toDate: "",
  status: "",
  vendorId: "",
  vendorName: "",
  sortBy: "date_desc",
};

export default function PurchaseRegisterPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<PurchaseRegisterFilterValues>(defaultFilters);
  const [draftFilters, setDraftFilters] =
    useState<PurchaseRegisterFilterValues>(defaultFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchLookup] = useLazySearchLookupQuery();

  const reportQuery = {
    keyword: appliedFilters.keyword,
    fromDate: appliedFilters.fromDate,
    toDate: appliedFilters.toDate,
    status: appliedFilters.status,
    vendorId: appliedFilters.vendorId,
    sortBy: appliedFilters.sortBy,
    page,
    limit,
  };

  const { data, isLoading, isError } = useGetPurchaseRegisterQuery(reportQuery);
  const report = data;
  const rows = report?.items ?? [];
  const totals = report?.totals;

  const activeFilterCount = useMemo(() => {
    return [
      appliedFilters.keyword,
      appliedFilters.fromDate || appliedFilters.toDate,
      appliedFilters.status,
      appliedFilters.vendorId,
    ].filter(Boolean).length;
  }, [appliedFilters]);

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

  const handleOpenFilters = () => {
    setDraftFilters(appliedFilters);
    setIsFilterOpen(true);
  };

  const handleDateRangeChange = (range: DateRangeValue) => {
    setAppliedFilters((current) => ({ ...current, ...range }));
    setDraftFilters((current) => ({ ...current, ...range }));
    setPage(1);
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  return (
    <ReportLayout>
      <ReportLayout.Breadcrumb title="Purchase Register" />

      <ReportLayout.Header className="sm:justify-end">
        <ReportLayout.Actions>
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
        </ReportLayout.Actions>
      </ReportLayout.Header>

      <ReportLayout.Content>
        <ReportLayout.Table>
          <PurchaseRegisterTable
            rows={rows}
            totals={totals}
            isLoading={isLoading}
            isError={isError}
          />
        </ReportLayout.Table>
        <PaginationControls
          page={report?.page ?? page}
          limit={report?.limit ?? limit}
          total={report?.total ?? 0}
          totalPages={report?.totalPages ?? 0}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
        />
      </ReportLayout.Content>

      <TopDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Purchase Register Filters"
      >
        <PurchaseRegisterFilterForm
          values={draftFilters}
          statusOptions={statusOptions}
          sortOptions={sortOptions}
          onChange={(values) => {
            const next = { ...draftFilters, ...values };
            setDraftFilters(next);
            if ("fromDate" in values || "toDate" in values) {
              setAppliedFilters((c) => ({ ...c, fromDate: next.fromDate, toDate: next.toDate }));
              setPage(1);
            }
          }}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          searchVendors={(keyword) =>
            searchLookup({
              source: "vendors",
              keyword,
              limit: 10,
            })
          }
        />
      </TopDrawer>
    </ReportLayout>
  );
}
