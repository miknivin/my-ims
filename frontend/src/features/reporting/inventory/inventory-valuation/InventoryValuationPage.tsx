import { useState } from "react";
import { useSearchParams } from "react-router";
import { useGetInventoryValuationQuery } from "@/redux/api/inventoryReportsApi";
import { useGetCategoriesQuery } from "@/redux/api/categoryApi";
import { useGetWarehousesQuery } from "@/redux/api/warehouseApi";
import Button from "@/shared/components/ui/button/Button";
import { TopDrawer } from "@/shared/components/ui/top-drawer";
import { ReportLayout } from "@/features/reporting/components";
import InventoryValuationFilterForm, {
  InventoryValuationFilterValues,
} from "./InventoryValuationFilterForm";
import InventoryValuationTable from "./InventoryValuationTable";

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TOGGLE_BASE = "px-3 py-1.5 text-sm font-medium transition-colors";
const TOGGLE_ACTIVE = "bg-brand-500 text-white";
const TOGGLE_INACTIVE =
  "bg-transparent text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800";

const defaultFilters: InventoryValuationFilterValues = {
  categoryId: "",
  warehouseId: "",
  showZeroStock: false,
};

function filtersFromParams(params: URLSearchParams): {
  groupBy: "category" | "warehouse";
  asOfDate: string;
  filters: InventoryValuationFilterValues;
} {
  return {
    groupBy: (params.get("groupBy") as "category" | "warehouse") ?? "category",
    asOfDate: params.get("asOfDate") ?? new Date().toISOString().split("T")[0],
    filters: {
      categoryId: params.get("categoryId") ?? "",
      warehouseId: params.get("warehouseId") ?? "",
      showZeroStock: params.get("showZeroStock") === "true",
    },
  };
}

export default function InventoryValuationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = filtersFromParams(searchParams);

  const [groupBy, setGroupBy] = useState<"category" | "warehouse">(initial.groupBy);
  const [asOfDate, setAsOfDate] = useState(initial.asOfDate);
  const [appliedFilters, setAppliedFilters] = useState<InventoryValuationFilterValues>(initial.filters);
  const [draftFilters, setDraftFilters] = useState<InventoryValuationFilterValues>(initial.filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();

  const { data, isLoading, isError } = useGetInventoryValuationQuery({
    groupBy,
    asOfDate,
    categoryId: appliedFilters.categoryId || undefined,
    warehouseId: appliedFilters.warehouseId || undefined,
    showZeroStock: appliedFilters.showZeroStock || undefined,
  });

  const syncParams = (
    nextGroupBy: "category" | "warehouse",
    nextDate: string,
    nextFilters: InventoryValuationFilterValues,
  ) => {
    const p = new URLSearchParams();
    if (nextGroupBy !== "category") p.set("groupBy", nextGroupBy);
    if (nextDate) p.set("asOfDate", nextDate);
    if (nextFilters.categoryId) p.set("categoryId", nextFilters.categoryId);
    if (nextFilters.warehouseId) p.set("warehouseId", nextFilters.warehouseId);
    if (nextFilters.showZeroStock) p.set("showZeroStock", "true");
    setSearchParams(p, { replace: true });
  };

  const handleGroupByChange = (mode: "category" | "warehouse") => {
    setGroupBy(mode);
    syncParams(mode, asOfDate, appliedFilters);
  };

  const handleAsOfDateChange = (date: string) => {
    setAsOfDate(date);
    syncParams(groupBy, date, appliedFilters);
  };

  const activeFilterCount = [
    appliedFilters.categoryId,
    appliedFilters.warehouseId,
    appliedFilters.showZeroStock ? "1" : "",
  ].filter(Boolean).length;

  return (
    <ReportLayout>
      <ReportLayout.Breadcrumb title="Inventory Valuation" />

      <div className="flex flex-wrap items-end justify-end gap-2">
        <div className="flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700">
          <button
            type="button"
            onClick={() => handleGroupByChange("category")}
            className={`${TOGGLE_BASE} ${groupBy === "category" ? TOGGLE_ACTIVE : TOGGLE_INACTIVE}`}
          >
            Category
          </button>
          <button
            type="button"
            onClick={() => handleGroupByChange("warehouse")}
            className={`${TOGGLE_BASE} border-l border-gray-300 dark:border-gray-700 ${groupBy === "warehouse" ? TOGGLE_ACTIVE : TOGGLE_INACTIVE}`}
          >
            Warehouse
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">As of</span>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => handleAsOfDateChange(e.target.value)}
            className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setDraftFilters(appliedFilters);
            setIsFilterOpen(true);
          }}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </Button>
      </div>

      {data && (
        <ReportLayout.Summary className="xl:grid-cols-2">
          <ReportLayout.Metric label="Total Quantity" value={data.totalQuantity.toLocaleString()} />
          <ReportLayout.Metric
            label="Total Value"
            value={fmt(data.totalValue)}
            tooltip="Should reconcile with the Inventory ledger on the Balance Sheet"
          />
        </ReportLayout.Summary>
      )}

      <ReportLayout.Content>
        <ReportLayout.Table>
          <InventoryValuationTable
            rows={data?.rows ?? []}
            groupBy={groupBy}
            totalQuantity={data?.totalQuantity}
            totalValue={data?.totalValue}
            isLoading={isLoading}
            isError={isError}
          />
        </ReportLayout.Table>
      </ReportLayout.Content>

      <TopDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Inventory Valuation Filters"
      >
        <InventoryValuationFilterForm
          values={draftFilters}
          categories={categories}
          warehouses={warehouses}
          onChange={(v) => setDraftFilters((c) => ({ ...c, ...v }))}
          onApply={() => {
            setAppliedFilters(draftFilters);
            syncParams(groupBy, asOfDate, draftFilters);
            setIsFilterOpen(false);
          }}
          onClear={() => {
            setDraftFilters(defaultFilters);
            setAppliedFilters(defaultFilters);
            syncParams(groupBy, asOfDate, defaultFilters);
            setIsFilterOpen(false);
          }}
        />
      </TopDrawer>
    </ReportLayout>
  );
}
