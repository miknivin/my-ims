import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown } from "lucide-react";
import { useGetPurchaseOrdersQuery } from "@/redux/api/purchaseOrderApi";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import ComponentCard from "@/shared/components/common/ComponentCard";
import Button from "@/shared/components/ui/button/Button";
import DateRangePicker, { DateRangeValue } from "@/shared/components/form/DateRangePicker";
import PaginationControls from "@/shared/components/filtering/PaginationControls";
import { useUrlFilterState } from "@/shared/hooks/useUrlFilterState";
import PurchaseOrderTable from "@/features/operations/purchase-order/PurchaseOrderTable";

const PO_STATUSES = ["Draft", "Submitted", "Cancelled"] as const;
type PoStatus = (typeof PO_STATUSES)[number];

const defaults = {
  keyword: "",
  statuses: "",
  fromDate: "",
  toDate: "",
  page: "1",
  limit: "20",
};

function StatusCheckboxDropdown({
  selected,
  onChange,
}: {
  selected: PoStatus[];
  onChange: (next: PoStatus[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (status: PoStatus) => {
    const next = selected.includes(status)
      ? selected.filter((s) => s !== status)
      : [...selected, status];
    onChange(next.length === 0 ? [...PO_STATUSES] : next);
  };

  const isAllSelected = selected.length === PO_STATUSES.length;
  const label = isAllSelected
    ? "All Statuses"
    : selected.length === 1
      ? selected[0]
      : `${selected.length} Statuses`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 items-center gap-2 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      >
        <span>{label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg dark:border-white/[0.08] dark:bg-gray-900">
          {PO_STATUSES.map((status) => (
            <label
              key={status}
              className="flex cursor-pointer items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.04]"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                checked={selected.includes(status)}
                onChange={() => toggle(status)}
              />
              {status}
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function PurchaseOrderListPage() {
  const navigate = useNavigate();
  const { values, update } = useUrlFilterState(defaults);

  const selectedStatuses: PoStatus[] = values.statuses
    ? (values.statuses.split(",").filter(Boolean) as PoStatus[])
    : [...PO_STATUSES];

  const isAllSelected = selectedStatuses.length === PO_STATUSES.length;

  const { data, isLoading, isError } = useGetPurchaseOrdersQuery({
    keyword: values.keyword || undefined,
    statuses: isAllSelected ? undefined : selectedStatuses,
    fromDate: values.fromDate || undefined,
    toDate: values.toDate || undefined,
    page: Number(values.page),
    limit: Number(values.limit),
  });

  const handleDateChange = (range: DateRangeValue) => {
    update({ fromDate: range.fromDate, toDate: range.toDate, page: "1" }, false);
  };

  const handleStatusChange = (next: PoStatus[]) => {
    const isAll = next.length === PO_STATUSES.length;
    update({ statuses: isAll ? "" : next.join(","), page: "1" }, false);
  };

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Purchase Order" />

      <div className="my-5 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <StatusCheckboxDropdown
          selected={selectedStatuses}
          onChange={handleStatusChange}
        />

        <DateRangePicker
          value={{ fromDate: values.fromDate, toDate: values.toDate }}
          onChange={handleDateChange}
          className="w-full sm:w-72"
        />

        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => navigate("/operations/purchase-order/new")}
        >
          Add +
        </Button>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Purchase Orders" desc="">
          <div className="space-y-4">
            <PurchaseOrderTable
              purchaseOrders={data?.items ?? []}
              isLoading={isLoading}
              isError={isError}
            />
            <PaginationControls
              page={data?.page ?? Number(values.page)}
              limit={data?.limit ?? Number(values.limit)}
              total={data?.total ?? 0}
              totalPages={data?.totalPages ?? 0}
              onPageChange={(page) => update({ page: String(page) }, false)}
              onLimitChange={(limit) =>
                update({ limit: String(limit), page: "1" }, false)
              }
            />
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
