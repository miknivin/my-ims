import { useState } from "react";
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

const today = new Date().toISOString().split("T")[0];

const defaultFilters: InventoryValuationFilterValues = {
  categoryId: "",
  warehouseId: "",
  showZeroStock: false,
};

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InventoryValuationPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [asOfDate, setAsOfDate] = useState(today);
  const [appliedFilters, setAppliedFilters] = useState<InventoryValuationFilterValues>(defaultFilters);
  const [draftFilters, setDraftFilters] = useState<InventoryValuationFilterValues>(defaultFilters);

  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();

  const { data, isLoading, isError } = useGetInventoryValuationQuery({
    asOfDate,
    categoryId: appliedFilters.categoryId || undefined,
    warehouseId: appliedFilters.warehouseId || undefined,
    showZeroStock: appliedFilters.showZeroStock || undefined,
  });

  const activeFilterCount = [
    appliedFilters.categoryId,
    appliedFilters.warehouseId,
    appliedFilters.showZeroStock ? "1" : "",
  ].filter(Boolean).length;

  return (
    <ReportLayout>
      <ReportLayout.Breadcrumb title="Inventory Valuation" />

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
        </ReportLayout.Actions>
      </ReportLayout.Header>

      {data && (
        <ReportLayout.Summary className="xl:grid-cols-2">
          <ReportLayout.Metric label="Total Quantity" value={data.totalQuantity.toLocaleString()} />
          <ReportLayout.Metric
            label="Total Value"
            value={fmt(data.totalValue)}
            hint="Should reconcile with the Inventory ledger on the Balance Sheet"
          />
        </ReportLayout.Summary>
      )}

      <ReportLayout.Content>
        <ReportLayout.Table>
          <InventoryValuationTable
            rows={data?.rows ?? []}
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
            setIsFilterOpen(false);
          }}
          onClear={() => {
            setDraftFilters(defaultFilters);
            setAppliedFilters(defaultFilters);
            setIsFilterOpen(false);
          }}
        />
      </TopDrawer>
    </ReportLayout>
  );
}
