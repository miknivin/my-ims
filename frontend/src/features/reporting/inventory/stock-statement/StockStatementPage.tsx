import { useState } from "react";
import { useSearchParams } from "react-router";
import { useGetStockStatementQuery } from "@/redux/api/inventoryReportsApi";
import { useGetCategoriesQuery } from "@/redux/api/categoryApi";
import { useGetWarehousesQuery } from "@/redux/api/warehouseApi";
import DateRangePicker, { DateRangeValue } from "@/shared/components/form/DateRangePicker";
import Button from "@/shared/components/ui/button/Button";
import { TopDrawer } from "@/shared/components/ui/top-drawer";
import { ReportLayout } from "@/features/reporting/components";
import StockStatementFilterForm, { StockStatementFilterValues } from "./StockStatementFilterForm";
import StockStatementTable from "./StockStatementTable";

function today() {
  return new Date().toISOString().split("T")[0];
}
function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TOGGLE_BASE = "px-3 py-1.5 text-sm font-medium transition-colors";
const TOGGLE_ACTIVE = "bg-brand-500 text-white";
const TOGGLE_INACTIVE =
  "bg-transparent text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800";

function filtersFromParams(params: URLSearchParams): StockStatementFilterValues {
  return {
    groupBy: (params.get("groupBy") as "category" | "warehouse") ?? "category",
    fromDate: params.get("fromDate") ?? firstOfMonth(),
    toDate: params.get("toDate") ?? today(),
    categoryId: params.get("categoryId") ?? "",
    warehouseId: params.get("warehouseId") ?? "",
    showZeroStock: params.get("showZeroStock") === "true",
  };
}

function filtersToParams(f: StockStatementFilterValues): URLSearchParams {
  const p = new URLSearchParams();
  if (f.groupBy !== "category") p.set("groupBy", f.groupBy);
  if (f.fromDate) p.set("fromDate", f.fromDate);
  if (f.toDate) p.set("toDate", f.toDate);
  if (f.categoryId) p.set("categoryId", f.categoryId);
  if (f.warehouseId) p.set("warehouseId", f.warehouseId);
  if (f.showZeroStock) p.set("showZeroStock", "true");
  return p;
}

export default function StockStatementPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [appliedFilters, setAppliedFilters] = useState<StockStatementFilterValues>(
    () => filtersFromParams(searchParams),
  );
  const [draftFilters, setDraftFilters] = useState<StockStatementFilterValues>(appliedFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();

  const { data, isLoading, isError } = useGetStockStatementQuery({
    fromDate: appliedFilters.fromDate,
    toDate: appliedFilters.toDate,
    groupBy: appliedFilters.groupBy,
    categoryId: appliedFilters.categoryId || undefined,
    warehouseId: appliedFilters.warehouseId || undefined,
    showZeroStock: appliedFilters.showZeroStock || undefined,
  });

  const drawerFilterCount = [
    appliedFilters.categoryId,
    appliedFilters.warehouseId,
    appliedFilters.showZeroStock ? "1" : "",
  ].filter(Boolean).length;

  const commitFilters = (next: StockStatementFilterValues) => {
    setAppliedFilters(next);
    setSearchParams(filtersToParams(next), { replace: true });
  };

  const handleGroupByChange = (mode: "category" | "warehouse") => {
    const next = { ...appliedFilters, groupBy: mode };
    commitFilters(next);
    setDraftFilters((prev) => ({ ...prev, groupBy: mode }));
  };

  const handleDateRangeChange = (range: DateRangeValue) => {
    const next = { ...appliedFilters, ...range };
    commitFilters(next);
    setDraftFilters((prev) => ({ ...prev, ...range }));
  };

  const handleOpenFilters = () => {
    setDraftFilters(appliedFilters);
    setIsFilterOpen(true);
  };

  const handleApplyFilters = () => {
    commitFilters(draftFilters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    const reset: StockStatementFilterValues = {
      groupBy: "category",
      fromDate: firstOfMonth(),
      toDate: today(),
      categoryId: "",
      warehouseId: "",
      showZeroStock: false,
    };
    commitFilters(reset);
    setDraftFilters(reset);
    setIsFilterOpen(false);
  };

  return (
    <ReportLayout>
      <ReportLayout.Breadcrumb title="Stock Statement" />

      <div className="flex flex-wrap items-end justify-end gap-2">
        <div className="flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700">
          <button
            type="button"
            onClick={() => handleGroupByChange("category")}
            className={`${TOGGLE_BASE} ${appliedFilters.groupBy === "category" ? TOGGLE_ACTIVE : TOGGLE_INACTIVE}`}
          >
            Category
          </button>
          <button
            type="button"
            onClick={() => handleGroupByChange("warehouse")}
            className={`${TOGGLE_BASE} border-l border-gray-300 dark:border-gray-700 ${appliedFilters.groupBy === "warehouse" ? TOGGLE_ACTIVE : TOGGLE_INACTIVE}`}
          >
            Warehouse
          </button>
        </div>

        <DateRangePicker
          value={{ fromDate: appliedFilters.fromDate, toDate: appliedFilters.toDate }}
          onChange={handleDateRangeChange}
          className="w-full sm:w-80"
        />

        <Button type="button" variant="outline" onClick={handleOpenFilters}>
          Filters{drawerFilterCount > 0 ? ` (${drawerFilterCount})` : ""}
        </Button>
      </div>

      {data && (
        <ReportLayout.Summary className="xl:grid-cols-4">
          <ReportLayout.Metric label="Opening Value" value={fmt(data.totalOpeningValue)} />
          <ReportLayout.Metric label="Inward Value" value={fmt(data.totalInwardValue)} />
          <ReportLayout.Metric label="Outward Value" value={fmt(data.totalOutwardValue)} />
          <ReportLayout.Metric label="Closing Value" value={fmt(data.totalClosingValue)} />
        </ReportLayout.Summary>
      )}

      <ReportLayout.Content>
        <ReportLayout.Table>
          <StockStatementTable
            rows={data?.rows ?? []}
            groupBy={appliedFilters.groupBy}
            totalOpeningValue={data?.totalOpeningValue}
            totalInwardValue={data?.totalInwardValue}
            totalOutwardValue={data?.totalOutwardValue}
            totalClosingValue={data?.totalClosingValue}
            isLoading={isLoading}
            isError={isError}
          />
        </ReportLayout.Table>
      </ReportLayout.Content>

      <TopDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Stock Statement Filters"
      >
        <StockStatementFilterForm
          values={draftFilters}
          categories={categories}
          warehouses={warehouses}
          onChange={(v) => {
            const next = { ...draftFilters, ...v };
            setDraftFilters(next);
            if ("fromDate" in v || "toDate" in v) {
              commitFilters({ ...appliedFilters, fromDate: next.fromDate, toDate: next.toDate });
            }
          }}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      </TopDrawer>
    </ReportLayout>
  );
}
