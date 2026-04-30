import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ProductListQueryParams,
  ProductStatus,
  useGetProductsQuery,
} from "../../app/api/productApi";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import AppliedFilterChips from "../../components/filtering/AppliedFilterChips";
import ListFilterToolbar, {
  FilterFieldConfig,
} from "../../components/filtering/ListFilterToolbar";
import PaginationControls from "../../components/filtering/PaginationControls";
import ProductHeader from "../../components/page-components/masters/product/ProductHeader";
import ProductTable from "../../components/tables/ProductTable";
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
  taxId: "",
  baseUomId: "",
  groupCategoryId: "",
  subGroupCategoryId: "",
  vendorId: "",
};

const sortOptions: SortOption[] = [
  { value: "name", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "code", label: "Code (A-Z)" },
  { value: "code_desc", label: "Code (Z-A)" },
  { value: "createdAt_desc", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
];

export default function ProductMaster() {
  const navigate = useNavigate();
  const { values, update, clear, clearAll } = useUrlFilterState(defaults);
  const [referenceLabels, setReferenceLabels] = useState<Record<string, string>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const lookupKeys = useMemo(
    () =>
      [
        "taxId",
        "baseUomId",
        "groupCategoryId",
        "subGroupCategoryId",
        "vendorId",
      ] as const,
    []
  );

  const queryParams: ProductListQueryParams = useMemo(
    () => ({
      keyword: values.keyword || undefined,
      page: Number(values.page),
      limit: Number(values.limit),
      sortBy: values.sortBy,
      status: (values.status || undefined) as ProductStatus | undefined,
      taxId: values.taxId || undefined,
      baseUomId: values.baseUomId || undefined,
      groupCategoryId: values.groupCategoryId || undefined,
      subGroupCategoryId: values.subGroupCategoryId || undefined,
      vendorId: values.vendorId || undefined,
    }),
    [values]
  );

  const { data, isLoading, isError } = useGetProductsQuery(queryParams);
  const resolvedLabels = useResolvedLookupLabels([
    { key: "taxId", source: "taxes", value: values.taxId || undefined },
    { key: "baseUomId", source: "uoms", value: values.baseUomId || undefined },
    { key: "groupCategoryId", source: "categories", value: values.groupCategoryId || undefined },
    { key: "subGroupCategoryId", source: "categories", value: values.subGroupCategoryId || undefined },
    { key: "vendorId", source: "vendors", value: values.vendorId || undefined },
  ]);

  useEffect(() => {
    setReferenceLabels((current) => {
      const next = { ...current, ...resolvedLabels };

      lookupKeys.forEach((key) => {
        if (!values[key]) {
          delete next[key];
        }
      });

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
  }, [lookupKeys, resolvedLabels, values]);

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
      key: "taxId",
      label: "Tax",
      type: "lookup",
      source: "taxes",
      value: values.taxId,
      displayValue: referenceLabels.taxId ?? "",
      placeholder: "Search tax",
    },
    {
      key: "baseUomId",
      label: "Base UOM",
      type: "lookup",
      source: "uoms",
      value: values.baseUomId,
      displayValue: referenceLabels.baseUomId ?? "",
      placeholder: "Search UOM",
    },
    {
      key: "groupCategoryId",
      label: "Group Category",
      type: "lookup",
      source: "categories",
      value: values.groupCategoryId,
      displayValue: referenceLabels.groupCategoryId ?? "",
      placeholder: "Search category",
    },
    {
      key: "subGroupCategoryId",
      label: "Sub-group Category",
      type: "lookup",
      source: "categories",
      value: values.subGroupCategoryId,
      displayValue: referenceLabels.subGroupCategoryId ?? "",
      placeholder: "Search sub-group",
    },
    {
      key: "vendorId",
      label: "Vendor",
      type: "lookup",
      source: "vendors",
      value: values.vendorId,
      displayValue: referenceLabels.vendorId ?? "",
      placeholder: "Search vendor",
    },
  ];

  const chips = [
    values.keyword ? { key: "keyword", label: "Search", value: values.keyword } : null,
    values.status ? { key: "status", label: "Status", value: values.status } : null,
    values.taxId ? { key: "taxId", label: "Tax", value: referenceLabels.taxId ?? values.taxId } : null,
    values.baseUomId ? { key: "baseUomId", label: "Base UOM", value: referenceLabels.baseUomId ?? values.baseUomId } : null,
    values.groupCategoryId ? { key: "groupCategoryId", label: "Group Category", value: referenceLabels.groupCategoryId ?? values.groupCategoryId } : null,
    values.subGroupCategoryId ? { key: "subGroupCategoryId", label: "Sub-group", value: referenceLabels.subGroupCategoryId ?? values.subGroupCategoryId } : null,
    values.vendorId ? { key: "vendorId", label: "Vendor", value: referenceLabels.vendorId ?? values.vendorId } : null,
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>;
  const hasActiveFilters = chips.length > 0;

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Product Master" />
      <ProductHeader
        onAdd={() => navigate("/masters/product/new")}
        onFilter={() => setIsFilterOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />
      <div className="space-y-6">
        <ComponentCard title="Product Catalogue">
          <div className="space-y-4">
            <AppliedFilterChips
              chips={chips}
              onRemove={(key) => {
                clear(key as keyof typeof defaults);
                if (key !== "keyword" && key !== "status") {
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

            <ProductTable
              products={data?.items ?? []}
              isLoading={isLoading}
              isError={isError}
              onEdit={(product) => navigate(`/masters/product/${product.id}/edit`)}
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
        title="Product Filters"
        description="Refine the product catalogue with search, sorting, and lookup filters."
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
