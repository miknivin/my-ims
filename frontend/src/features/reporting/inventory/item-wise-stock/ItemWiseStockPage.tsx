import { useState } from "react";
import { useSearchParams } from "react-router";
import { useLazyGetProductsQuery, ProductListItem } from "@/redux/api/productApi";
import { useGetItemWiseStockQuery } from "@/redux/api/inventoryReportsApi";
import { useGetCategoriesQuery } from "@/redux/api/categoryApi";
import { useGetWarehousesQuery } from "@/redux/api/warehouseApi";
import { PagedResponse } from "@/shared/types/filtering";
import DateRangePicker, { DateRangeValue } from "@/shared/components/form/DateRangePicker";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import Button from "@/shared/components/ui/button/Button";
import { TopDrawer } from "@/shared/components/ui/top-drawer";
import { ReportLayout } from "@/features/reporting/components";
import ItemWiseStockFilterForm, { ItemWiseStockFilterValues } from "./ItemWiseStockFilterForm";
import ItemWiseStockTable from "./ItemWiseStockTable";

function today() {
  return new Date().toISOString().split("T")[0];
}
function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface AppliedFilters extends ItemWiseStockFilterValues {
  itemId: string;
  itemLabel: string;
}

function filtersFromParams(params: URLSearchParams): AppliedFilters {
  return {
    fromDate: params.get("fromDate") ?? firstOfMonth(),
    toDate: params.get("toDate") ?? today(),
    itemId: params.get("itemId") ?? "",
    itemLabel: params.get("itemLabel") ?? "",
    categoryId: params.get("categoryId") ?? "",
    warehouseId: params.get("warehouseId") ?? "",
    showZeroStock: params.get("showZeroStock") === "true",
  };
}

function filtersToParams(f: AppliedFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.fromDate) p.set("fromDate", f.fromDate);
  if (f.toDate) p.set("toDate", f.toDate);
  if (f.itemId) { p.set("itemId", f.itemId); p.set("itemLabel", f.itemLabel); }
  if (f.categoryId) p.set("categoryId", f.categoryId);
  if (f.warehouseId) p.set("warehouseId", f.warehouseId);
  if (f.showZeroStock) p.set("showZeroStock", "true");
  return p;
}

export default function ItemWiseStockPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>(
    () => filtersFromParams(searchParams),
  );
  const [draftFilters, setDraftFilters] = useState<ItemWiseStockFilterValues>(appliedFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [searchProducts] = useLazyGetProductsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();

  const { data, isLoading, isError } = useGetItemWiseStockQuery({
    fromDate: appliedFilters.fromDate || undefined,
    toDate: appliedFilters.toDate || undefined,
    itemId: appliedFilters.itemId || undefined,
    categoryId: appliedFilters.categoryId || undefined,
    warehouseId: appliedFilters.warehouseId || undefined,
    showZeroStock: appliedFilters.showZeroStock || undefined,
  });

  const drawerFilterCount = [
    appliedFilters.categoryId,
    appliedFilters.warehouseId,
    appliedFilters.showZeroStock ? "1" : "",
  ].filter(Boolean).length;

  const commit = (next: AppliedFilters) => {
    setAppliedFilters(next);
    setSearchParams(filtersToParams(next), { replace: true });
  };

  const handleDateRangeChange = (range: DateRangeValue) => {
    setDraftFilters((c) => ({ ...c, ...range }));
    commit({ ...appliedFilters, ...range });
  };

  const handleItemSelect = (item: ProductListItem | null) => {
    commit({
      ...appliedFilters,
      itemId: item?.id ?? "",
      itemLabel: item ? `${item.basicInfo.name} (${item.basicInfo.code})` : "",
    });
  };

  const handleOpenFilters = () => {
    setDraftFilters(appliedFilters);
    setIsFilterOpen(true);
  };

  const handleApplyFilters = () => {
    commit({ ...appliedFilters, ...draftFilters });
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    const reset: ItemWiseStockFilterValues = {
      fromDate: firstOfMonth(),
      toDate: today(),
      categoryId: "",
      warehouseId: "",
      showZeroStock: false,
    };
    setDraftFilters(reset);
    commit({ ...appliedFilters, ...reset, itemId: "", itemLabel: "" });
    setIsFilterOpen(false);
  };

  return (
    <ReportLayout>
      <ReportLayout.Breadcrumb title="Item-wise Stock" />

      <div className="flex flex-wrap items-end justify-end gap-2">
        <AutocompleteSelect<ProductListItem, PagedResponse<ProductListItem>>
          value={appliedFilters.itemLabel}
          placeholder="All items"
          search={(keyword) => searchProducts({ keyword, limit: 10, page: 1 })}
          getItems={(result) => result.items}
          getOptionKey={(item) => item.id}
          getOptionLabel={(item) => `${item.basicInfo.name} (${item.basicInfo.code})`}
          onSelect={handleItemSelect}
          className="w-full sm:w-60"
        />

        <DateRangePicker
          value={{ fromDate: appliedFilters.fromDate, toDate: appliedFilters.toDate }}
          onChange={handleDateRangeChange}
          className="w-full sm:w-72"
        />

        <Button type="button" variant="outline" onClick={handleOpenFilters}>
          Filters{drawerFilterCount > 0 ? ` (${drawerFilterCount})` : ""}
        </Button>
      </div>

      {data && (
        <ReportLayout.Summary className="xl:grid-cols-2">
          <ReportLayout.Metric label="Total Closing Qty" value={data.totalClosingQty.toLocaleString()} />
          <ReportLayout.Metric label="Total Closing Value" value={fmt(data.totalClosingValue)} />
        </ReportLayout.Summary>
      )}

      <ReportLayout.Content>
        <ReportLayout.Table>
          <ItemWiseStockTable
            rows={data?.rows ?? []}
            totalClosingQty={data?.totalClosingQty}
            totalClosingValue={data?.totalClosingValue}
            isLoading={isLoading}
            isError={isError}
          />
        </ReportLayout.Table>
      </ReportLayout.Content>

      <TopDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Item-wise Stock Filters"
      >
        <ItemWiseStockFilterForm
          values={draftFilters}
          categories={categories}
          warehouses={warehouses}
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
