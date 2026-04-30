import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  CustomerListQueryParams,
  CustomerPriceLevel,
  CustomerStatus,
  CustomerType,
  useGetCustomersQuery,
} from "../../app/api/customerApi";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import AppliedFilterChips from "../../components/filtering/AppliedFilterChips";
import ListFilterToolbar, {
  FilterFieldConfig,
} from "../../components/filtering/ListFilterToolbar";
import PaginationControls from "../../components/filtering/PaginationControls";
import CustomerHeader from "../../components/page-components/masters/customer/CustomerHeader";
import CustomerTable from "../../components/tables/CustomerTable";
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
  customerType: "",
  priceLevel: "",
  ledgerId: "",
  defaultTaxId: "",
};

const sortOptions: SortOption[] = [
  { value: "name", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "code", label: "Code (A-Z)" },
  { value: "code_desc", label: "Code (Z-A)" },
  { value: "customerType", label: "Customer type (A-Z)" },
  { value: "customerType_desc", label: "Customer type (Z-A)" },
  { value: "createdAt_desc", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
];

export default function CustomerMaster() {
  const navigate = useNavigate();
  const { values, update, clear, clearAll } = useUrlFilterState(defaults);
  const [referenceLabels, setReferenceLabels] = useState<Record<string, string>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const queryParams: CustomerListQueryParams = useMemo(
    () => ({
      keyword: values.keyword || undefined,
      page: Number(values.page),
      limit: Number(values.limit),
      sortBy: values.sortBy,
      status: (values.status || undefined) as CustomerStatus | undefined,
      customerType: (values.customerType || undefined) as CustomerType | undefined,
      priceLevel: (values.priceLevel || undefined) as CustomerPriceLevel | undefined,
      ledgerId: values.ledgerId || undefined,
      defaultTaxId: values.defaultTaxId || undefined,
    }),
    [values]
  );

  const { data, isLoading, isError } = useGetCustomersQuery(queryParams);
  const resolvedLabels = useResolvedLookupLabels([
    { key: "ledgerId", source: "ledgers", value: values.ledgerId || undefined },
    { key: "defaultTaxId", source: "taxes", value: values.defaultTaxId || undefined },
  ]);

  useEffect(() => {
    setReferenceLabels((current) => {
      const next = { ...current, ...resolvedLabels };

      if (!values.ledgerId) {
        delete next.ledgerId;
      }

      if (!values.defaultTaxId) {
        delete next.defaultTaxId;
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
  }, [resolvedLabels, values.defaultTaxId, values.ledgerId]);

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
      key: "customerType",
      label: "Customer Type",
      type: "select",
      value: values.customerType,
      options: [
        { value: "Walk-in", label: "Walk-in" },
        { value: "Regular", label: "Regular" },
        { value: "Wholesale", label: "Wholesale" },
        { value: "Distributor", label: "Distributor" },
        { value: "Dealer", label: "Dealer" },
        { value: "Retail", label: "Retail" },
        { value: "Corporate", label: "Corporate" },
        { value: "Government", label: "Government" },
      ],
    },
    {
      key: "priceLevel",
      label: "Price Level",
      type: "select",
      value: values.priceLevel,
      options: [
        { value: "WRATE", label: "WRATE" },
        { value: "RRATE", label: "RRATE" },
        { value: "MRATE", label: "MRATE" },
        { value: "Special", label: "Special" },
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
      key: "defaultTaxId",
      label: "Default Tax",
      type: "lookup",
      source: "taxes",
      value: values.defaultTaxId,
      displayValue: referenceLabels.defaultTaxId ?? "",
      placeholder: "Search tax",
    },
  ];

  const chips = [
    values.keyword ? { key: "keyword", label: "Search", value: values.keyword } : null,
    values.status ? { key: "status", label: "Status", value: values.status } : null,
    values.customerType ? { key: "customerType", label: "Customer Type", value: values.customerType } : null,
    values.priceLevel ? { key: "priceLevel", label: "Price Level", value: values.priceLevel } : null,
    values.ledgerId ? { key: "ledgerId", label: "Ledger", value: referenceLabels.ledgerId ?? values.ledgerId } : null,
    values.defaultTaxId ? { key: "defaultTaxId", label: "Default Tax", value: referenceLabels.defaultTaxId ?? values.defaultTaxId } : null,
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>;
  const hasActiveFilters = chips.length > 0;

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Customer Master" />
      <CustomerHeader
        onAdd={() => navigate("/masters/customers/new")}
        onFilter={() => setIsFilterOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />
      <div className="space-y-6">
        <ComponentCard title="Customer Catalogue">
          <div className="space-y-4">
            <AppliedFilterChips
              chips={chips}
              onRemove={(key) => {
                clear(key as keyof typeof defaults);
                if (key === "ledgerId" || key === "defaultTaxId") {
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

            <CustomerTable
              customers={data?.items ?? []}
              isLoading={isLoading}
              isError={isError}
              onEdit={(customer) => navigate(`/masters/customers/${customer.id}/edit`)}
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
        title="Customer Filters"
        description="Filter customers using search, sort order, pricing, and lookup criteria."
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
