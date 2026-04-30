import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  VendorListQueryParams,
  VendorStatus,
  useGetVendorsQuery,
} from "../../app/api/vendorApi";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import AppliedFilterChips from "../../components/filtering/AppliedFilterChips";
import ListFilterToolbar, {
  FilterFieldConfig,
} from "../../components/filtering/ListFilterToolbar";
import PaginationControls from "../../components/filtering/PaginationControls";
import VendorHeader from "../../components/page-components/masters/vendor/VendorHeader";
import VendorTable from "../../components/tables/VendorTable";
import Button from "../../components/ui/button/Button";
import { OffCanvas } from "../../components/ui/offcanvas";
import { useResolvedLookupLabels } from "../../hooks/useResolvedLookupLabels";
import { useUrlFilterState } from "../../hooks/useUrlFilterState";
import { SortOption } from "../../types/filtering";

const defaults = {
  keyword: "",
  page: "1",
  limit: "20",
  sortBy: "name",
  status: "",
  ledgerId: "",
  currencyId: "",
};

const sortOptions: SortOption[] = [
  { value: "name", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "code", label: "Code (A-Z)" },
  { value: "code_desc", label: "Code (Z-A)" },
  { value: "createdAt_desc", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
  { value: "status", label: "Status (A-Z)" },
  { value: "status_desc", label: "Status (Z-A)" },
];

export default function VendorMaster() {
  const navigate = useNavigate();
  const { values, update, clear, clearAll } = useUrlFilterState(defaults);
  const [referenceLabels, setReferenceLabels] = useState<Record<string, string>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const queryParams: VendorListQueryParams = useMemo(
    () => ({
      keyword: values.keyword || undefined,
      page: Number(values.page),
      limit: Number(values.limit),
      sortBy: values.sortBy,
      status: (values.status || undefined) as VendorStatus | undefined,
      ledgerId: values.ledgerId || undefined,
      currencyId: values.currencyId || undefined,
    }),
    [values]
  );

  const { data, isLoading, isError } = useGetVendorsQuery(queryParams);
  const resolvedLabels = useResolvedLookupLabels([
    { key: "ledgerId", source: "ledgers", value: values.ledgerId || undefined },
    { key: "currencyId", source: "currencies", value: values.currencyId || undefined },
  ]);

  useEffect(() => {
    setReferenceLabels((current) => {
      const next = { ...current, ...resolvedLabels };

      if (!values.ledgerId) {
        delete next.ledgerId;
      }

      if (!values.currencyId) {
        delete next.currencyId;
      }

      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(next);

      if (
        currentKeys.length === nextKeys.length &&
        nextKeys.every((key) => current[key] === next[key])
      ) {
        return current;
      }

      return next;
    });
  }, [resolvedLabels, values.currencyId, values.ledgerId]);

  const handleAdd = () => {
    navigate("/masters/vendor/new");
  };

  const handleEdit = (vendorId: string) => {
    navigate(`/masters/vendor/${vendorId}/edit`);
  };

  const filters: FilterFieldConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      value: values.status,
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
    },
    {
      key: "ledgerId",
      label: "Ledger",
      type: "lookup",
      source: "ledgers",
      value: values.ledgerId,
      displayValue: referenceLabels.ledgerId ?? "",
      placeholder: "Search ledger",
    },
    {
      key: "currencyId",
      label: "Currency",
      type: "lookup",
      source: "currencies",
      value: values.currencyId,
      displayValue: referenceLabels.currencyId ?? "",
      placeholder: "Search currency",
    },
  ];

  const chips = [
    values.keyword ? { key: "keyword", label: "Search", value: values.keyword } : null,
    values.status ? { key: "status", label: "Status", value: values.status } : null,
    values.ledgerId ? { key: "ledgerId", label: "Ledger", value: referenceLabels.ledgerId ?? values.ledgerId } : null,
    values.currencyId ? { key: "currencyId", label: "Currency", value: referenceLabels.currencyId ?? values.currencyId } : null,
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>;
  const hasActiveFilters = chips.length > 0;

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Vendor Master" />
      <VendorHeader
        onAdd={handleAdd}
        onFilter={() => setIsFilterOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />
      <div className="space-y-6">
        <ComponentCard title="Vendor Catalogue">
          <div className="space-y-4">
            <AppliedFilterChips
              chips={chips}
              onRemove={(key) => {
                clear(key as keyof typeof defaults);
                if (key === "ledgerId" || key === "currencyId") {
                  setReferenceLabels((current) => {
                    const next = { ...current };
                    delete next[key];
                    return next;
                  });
                }
              }}
              onClearAll={() => {
                clearAll();
                setReferenceLabels({});
              }}
            />

            <VendorTable
              vendors={data?.items ?? []}
              isLoading={isLoading}
              isError={isError}
              onEdit={(vendor) => handleEdit(vendor.id)}
            />

            <PaginationControls
              page={data?.page ?? Number(values.page)}
              limit={data?.limit ?? Number(values.limit)}
              total={data?.total ?? 0}
              totalPages={data?.totalPages ?? 0}
              onPageChange={(page) => update({ page: String(page) }, false)}
              onLimitChange={(limit) => update({ limit: String(limit) })}
            />
          </div>
        </ComponentCard>
      </div>

      <OffCanvas
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Vendor Filters"
        description="Filter vendors with status, currency, ledger, search, and sorting controls."
      >
        <div className="space-y-4">
          <ListFilterToolbar
            keyword={values.keyword}
            sortBy={values.sortBy}
            sortOptions={sortOptions}
            filters={filters}
            onKeywordChange={(value) => update({ keyword: value })}
            onSortChange={(value) => update({ sortBy: value })}
            onFilterChange={(key, value) => update({ [key]: value } as Partial<typeof defaults>)}
            onLookupChange={(key, item) => {
              setReferenceLabels((current) => ({
                ...current,
                [key]: item?.label ?? "",
              }));
              update({ [key]: item?.id ?? "" } as Partial<typeof defaults>);
            }}
          />
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearAll();
                setReferenceLabels({});
              }}
            >
              Clear
            </Button>
            <Button type="button" variant="primary" onClick={() => setIsFilterOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </OffCanvas>
    </div>
  );
}
