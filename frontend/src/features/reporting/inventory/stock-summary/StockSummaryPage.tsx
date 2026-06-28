import { useState } from "react";
import { useGetStockSummaryQuery } from "@/redux/api/inventoryReportsApi";
import { useGetCategoriesQuery } from "@/redux/api/categoryApi";
import { useGetWarehousesQuery } from "@/redux/api/warehouseApi";
import Button from "@/shared/components/ui/button/Button";
import { TopDrawer } from "@/shared/components/ui/top-drawer";
import { ReportLayout } from "@/features/reporting/components";
import StockSummaryFilterForm, { StockSummaryFilterValues } from "./StockSummaryFilterForm";
import StockSummaryTable from "./StockSummaryTable";

const defaultFilters: StockSummaryFilterValues = {
  categoryId: "",
  warehouseId: "",
  showZeroStock: false,
};

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function StockSummaryPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<StockSummaryFilterValues>(defaultFilters);
  const [draftFilters, setDraftFilters] = useState<StockSummaryFilterValues>(defaultFilters);

  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();

  const { data, isLoading, isError } = useGetStockSummaryQuery({
    categoryId: appliedFilters.categoryId || undefined,
    warehouseId: appliedFilters.warehouseId || undefined,
    showZeroStock: appliedFilters.showZeroStock || undefined,
  });

  const activeFilterCount = [
    appliedFilters.categoryId,
    appliedFilters.warehouseId,
    appliedFilters.showZeroStock ? "1" : "",
  ].filter(Boolean).length;

  const handleOpenFilters = () => {
    setDraftFilters(appliedFilters);
    setIsFilterOpen(true);
  };

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
      <ReportLayout.Breadcrumb title="Stock Summary" />

      <ReportLayout.Header className="sm:justify-end">
        <ReportLayout.Actions>
          <Button type="button" variant="outline" onClick={handleOpenFilters}>
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Button>
        </ReportLayout.Actions>
      </ReportLayout.Header>

      {data && (
        <ReportLayout.Summary className="xl:grid-cols-2">
          <ReportLayout.Metric label="Total Quantity" value={data.totalQuantity.toLocaleString()} />
          <ReportLayout.Metric label="Total Value" value={fmt(data.totalValue)} />
        </ReportLayout.Summary>
      )}

      <ReportLayout.Content>
        <ReportLayout.Table>
          <StockSummaryTable
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
