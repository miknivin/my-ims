import { useState } from "react";
import { useSearchParams } from "react-router";
import { useLazyGetProductsQuery, ProductListItem } from "@/redux/api/productApi";
import { useGetWarehousesQuery } from "@/redux/api/warehouseApi";
import { useGetStockMovementQuery } from "@/redux/api/inventoryReportsApi";
import { PagedResponse } from "@/shared/types/filtering";
import DateRangePicker, { DateRangeValue } from "@/shared/components/form/DateRangePicker";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import { ReportLayout } from "@/features/reporting/components";
import StockMovementTable from "./StockMovementTable";

const SELECT_CLASS =
  "h-11 w-full sm:w-48 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function StockMovementPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [itemId, setItemId] = useState(() => searchParams.get("itemId") ?? "");
  const [itemName, setItemName] = useState(() => searchParams.get("itemName") ?? "");
  const [warehouseId, setWarehouseId] = useState(() => searchParams.get("warehouseId") ?? "");
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => ({
    fromDate: searchParams.get("fromDate") ?? "",
    toDate: searchParams.get("toDate") ?? "",
  }));

  const [searchProducts] = useLazyGetProductsQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();

  const skip = !itemId || !dateRange.fromDate || !dateRange.toDate;

  const { data, isLoading, isError } = useGetStockMovementQuery(
    { itemId, warehouseId: warehouseId || undefined, fromDate: dateRange.fromDate, toDate: dateRange.toDate },
    { skip },
  );

  const syncParams = (patch: {
    itemId?: string;
    itemName?: string;
    warehouseId?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    const current = {
      itemId,
      itemName,
      warehouseId,
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      ...patch,
    };
    const p = new URLSearchParams();
    if (current.itemId) p.set("itemId", current.itemId);
    if (current.itemName) p.set("itemName", current.itemName);
    if (current.warehouseId) p.set("warehouseId", current.warehouseId);
    if (current.fromDate) p.set("fromDate", current.fromDate);
    if (current.toDate) p.set("toDate", current.toDate);
    setSearchParams(p, { replace: true });
  };

  const handleSelectItem = (item: ProductListItem | null) => {
    const id = item?.id ?? "";
    const name = item ? `${item.basicInfo.name} (${item.basicInfo.code})` : "";
    setItemId(id);
    setItemName(name);
    syncParams({ itemId: id, itemName: name });
  };

  const handleWarehouseChange = (id: string) => {
    setWarehouseId(id);
    syncParams({ warehouseId: id });
  };

  const handleDateRangeChange = (range: DateRangeValue) => {
    setDateRange(range);
    syncParams({ fromDate: range.fromDate, toDate: range.toDate });
  };

  return (
    <ReportLayout>
      <ReportLayout.Breadcrumb title="Stock Movement" />

      <ReportLayout.Header className="sm:justify-end">
        <ReportLayout.Actions>
          <AutocompleteSelect<ProductListItem, PagedResponse<ProductListItem>>
            value={itemName}
            placeholder="Search item (required)"
            search={(keyword) => searchProducts({ keyword, limit: 10, page: 1 })}
            getItems={(result) => result.items}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) => `${item.basicInfo.name} (${item.basicInfo.code})`}
            onSelect={handleSelectItem}
            className="w-full sm:w-64"
          />
          <select
            value={warehouseId}
            onChange={(e) => handleWarehouseChange(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-full sm:w-80"
          />
        </ReportLayout.Actions>
      </ReportLayout.Header>

      {data && !skip && (
        <ReportLayout.Summary className="xl:grid-cols-4">
          <ReportLayout.Metric label="Opening Quantity" value={data.openingQuantity.toLocaleString()} />
          <ReportLayout.Metric label="Opening Value" value={fmt(data.openingValue)} />
          <ReportLayout.Metric label="Closing Quantity" value={data.closingQuantity.toLocaleString()} />
          <ReportLayout.Metric label="Closing Value" value={fmt(data.closingValue)} />
        </ReportLayout.Summary>
      )}

      <ReportLayout.Content>
        {skip ? (
          <ReportLayout.EmptyState
            title="Select an item and period"
            description="Search for an item and choose a date range to view its stock movement."
          />
        ) : (
          <ReportLayout.Table>
            <StockMovementTable
              rows={data?.rows ?? []}
              openingQuantity={data?.openingQuantity}
              openingValue={data?.openingValue}
              isLoading={isLoading}
              isError={isError}
            />
          </ReportLayout.Table>
        )}
      </ReportLayout.Content>
    </ReportLayout>
  );
}
