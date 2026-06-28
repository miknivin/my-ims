import { useState } from "react";
import { useLazyGetProductsQuery, ProductListItem } from "@/redux/api/productApi";
import { useGetItemWiseStockQuery } from "@/redux/api/inventoryReportsApi";
import { useGetCategoriesQuery } from "@/redux/api/categoryApi";
import { useGetWarehousesQuery } from "@/redux/api/warehouseApi";
import { PagedResponse } from "@/shared/types/filtering";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import Button from "@/shared/components/ui/button/Button";
import { TopDrawer } from "@/shared/components/ui/top-drawer";
import { ReportLayout } from "@/features/reporting/components";
import ItemWiseStockFilterForm, { ItemWiseStockFilterValues } from "./ItemWiseStockFilterForm";
import ItemWiseStockTable from "./ItemWiseStockTable";

const defaultFilters: ItemWiseStockFilterValues = {
  categoryId: "",
  warehouseId: "",
  showZeroStock: false,
};

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ItemWiseStockPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [itemId, setItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<ItemWiseStockFilterValues>(defaultFilters);
  const [draftFilters, setDraftFilters] = useState<ItemWiseStockFilterValues>(defaultFilters);

  const [searchProducts] = useLazyGetProductsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();

  const { data, isLoading, isError } = useGetItemWiseStockQuery({
    itemId: itemId || undefined,
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
      <ReportLayout.Breadcrumb title="Item-wise Stock" />

      <ReportLayout.Header className="sm:justify-end">
        <ReportLayout.Actions>
          <AutocompleteSelect<ProductListItem, PagedResponse<ProductListItem>>
            value={itemName}
            placeholder="Search item"
            search={(keyword) => searchProducts({ keyword, limit: 10 })}
            getItems={(result) => result.items}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) => `${item.basicInfo.name} (${item.basicInfo.code})`}
            onSelect={(item) => {
              setItemId(item?.id ?? "");
              setItemName(item ? `${item.basicInfo.name} (${item.basicInfo.code})` : "");
            }}
            className="w-full sm:w-64"
          />
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
          <ReportLayout.Metric label="Total Value" value={fmt(data.totalValue)} />
        </ReportLayout.Summary>
      )}

      <ReportLayout.Content>
        <ReportLayout.Table>
          <ItemWiseStockTable
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
        title="Item-wise Stock Filters"
      >
        <ItemWiseStockFilterForm
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
