import { useState } from "react";
import { useSearchParams } from "react-router";
import { useGetStockSummaryEnhancedQuery } from "@/redux/api/inventoryReportsApi";
import { useGetCategoriesQuery } from "@/redux/api/categoryApi";
import { useGetWarehousesQuery } from "@/redux/api/warehouseApi";
import Button from "@/shared/components/ui/button/Button";
import { TopDrawer } from "@/shared/components/ui/top-drawer";
import { ReportLayout } from "@/features/reporting/components";
import StockSummaryFilterForm, { StockSummaryFilterValues } from "./StockSummaryFilterForm";
import StockSummaryTable from "./StockSummaryTable";

const TOGGLE_BASE = "px-3 py-1.5 text-sm font-medium transition-colors";
const TOGGLE_ACTIVE = "bg-brand-500 text-white";
const TOGGLE_INACTIVE =
  "bg-transparent text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800";

function filtersFromParams(params: URLSearchParams): StockSummaryFilterValues {
  return {
    groupBy: (params.get("groupBy") as "category" | "warehouse") ?? "category",
    asOfDate: params.get("asOfDate") ?? "",
    categoryId: params.get("categoryId") ?? "",
    warehouseId: params.get("warehouseId") ?? "",
    showZeroStock: params.get("showZeroStock") === "true",
  };
}

function filtersToParams(filters: StockSummaryFilterValues): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.groupBy !== "category") params.set("groupBy", filters.groupBy);
  if (filters.asOfDate) params.set("asOfDate", filters.asOfDate);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.warehouseId) params.set("warehouseId", filters.warehouseId);
  if (filters.showZeroStock) params.set("showZeroStock", "true");
  return params;
}

export default function StockSummaryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [appliedFilters, setAppliedFilters] = useState<StockSummaryFilterValues>(
    () => filtersFromParams(searchParams),
  );
  const [draftFilters, setDraftFilters] = useState<StockSummaryFilterValues>(appliedFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();

  const { data, isLoading, isError } = useGetStockSummaryEnhancedQuery({
    groupBy: appliedFilters.groupBy,
    asOfDate: appliedFilters.asOfDate || undefined,
    categoryId: appliedFilters.categoryId || undefined,
    warehouseId: appliedFilters.warehouseId || undefined,
    showZeroStock: appliedFilters.showZeroStock || undefined,
  });

  const drawerFilterCount = [
    appliedFilters.categoryId,
    appliedFilters.warehouseId,
    appliedFilters.showZeroStock ? "1" : "",
  ].filter(Boolean).length;

  const commitFilters = (next: StockSummaryFilterValues) => {
    setAppliedFilters(next);
    setSearchParams(filtersToParams(next), { replace: true });
  };

  const handleGroupByChange = (mode: "category" | "warehouse") => {
    const next = { ...appliedFilters, groupBy: mode };
    commitFilters(next);
    setDraftFilters((prev) => ({ ...prev, groupBy: mode }));
  };

  const handleAsOfDateChange = (date: string) => {
    const next = { ...appliedFilters, asOfDate: date };
    commitFilters(next);
    setDraftFilters((prev) => ({ ...prev, asOfDate: date }));
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
    const reset: StockSummaryFilterValues = {
      groupBy: "category",
      asOfDate: "",
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
      <ReportLayout.Breadcrumb title="Stock Summary" />

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

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            As of
          </span>
          <input
            type="date"
            value={appliedFilters.asOfDate}
            onChange={(e) => handleAsOfDateChange(e.target.value)}
            className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>

        <Button type="button" variant="outline" onClick={handleOpenFilters}>
          Filters{drawerFilterCount > 0 ? ` (${drawerFilterCount})` : ""}
        </Button>
      </div>

      {data && (
        <ReportLayout.Summary className="xl:grid-cols-1">
          <ReportLayout.Metric label="Total Quantity" value={data.totalQuantity.toLocaleString()} />
        </ReportLayout.Summary>
      )}

      <ReportLayout.Content>
        <ReportLayout.Table>
          <StockSummaryTable
            rows={data?.rows ?? []}
            groupBy={appliedFilters.groupBy}
            totalQuantity={data?.totalQuantity}
            isLoading={isLoading}
            isError={isError}
          />
        </ReportLayout.Table>
      </ReportLayout.Content>

      <TopDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Stock Summary Filters"
      >
        <StockSummaryFilterForm
          values={draftFilters}
          categories={categories}
          warehouses={warehouses}
          onChange={(v) => setDraftFilters((c) => ({ ...c, ...v }))}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      </TopDrawer>
    </ReportLayout>
  );
}
