import { LookupOption } from "@/shared/types/filtering";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import Button from "@/shared/components/ui/button/Button";

export interface PurchaseRegisterFilterValues {
  keyword: string;
  fromDate: string;
  toDate: string;
  status: string;
  vendorId: string;
  vendorName: string;
  sortBy: string;
}

interface PurchaseRegisterFilterFormProps {
  values: PurchaseRegisterFilterValues;
  statusOptions: string[];
  sortOptions: Array<{ value: string; label: string }>;
  onChange: (values: Partial<PurchaseRegisterFilterValues>) => void;
  onApply: () => void;
  onClear: () => void;
  searchVendors: (
    keyword: string,
  ) =>
    | LookupOption[]
    | Promise<LookupOption[]>
    | { unwrap?: () => Promise<LookupOption[]> };
}

export default function PurchaseRegisterFilterForm({
  values,
  statusOptions,
  sortOptions,
  onChange,
  onApply,
  onClear,
  searchVendors,
}: PurchaseRegisterFilterFormProps) {
  const handleFromDateChange = (fromDate: string) => {
    onChange({
      fromDate,
      toDate: values.toDate && fromDate && fromDate > values.toDate ? fromDate : values.toDate,
    });
  };

  const handleToDateChange = (toDate: string) => {
    onChange({
      fromDate: values.fromDate && toDate && toDate < values.fromDate ? toDate : values.fromDate,
      toDate,
    });
  };

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Search">
          <input
            type="text"
            value={values.keyword}
            onChange={(event) => onChange({ keyword: event.target.value })}
            placeholder="Invoice, vendor, reference"
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </Field>

        <Field label="From Date">
          <input
            type="date"
            value={values.fromDate}
            max={values.toDate || undefined}
            onChange={(event) => handleFromDateChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </Field>

        <Field label="To Date">
          <input
            type="date"
            value={values.toDate}
            min={values.fromDate || undefined}
            onChange={(event) => handleToDateChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </Field>

        <Field label="Status">
          <select
            value={values.status}
            onChange={(event) => onChange({ status: event.target.value })}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="">All</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Vendor">
          <AutocompleteSelect<LookupOption, LookupOption[]>
            value={values.vendorName}
            placeholder="Search vendor"
            search={searchVendors}
            getItems={(result) => result}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) =>
              item.secondaryLabel
                ? `${item.label} (${item.secondaryLabel})`
                : item.label
            }
            onSelect={(item) =>
              onChange({
                vendorId: item?.id ?? "",
                vendorName: item?.label ?? "",
              })
            }
          />
        </Field>

        <Field label="Sort By">
          <select
            value={values.sortBy}
            onChange={(event) => onChange({ sortBy: event.target.value })}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClear}>
          Clear
        </Button>
        <Button type="submit" variant="primary">
          Apply Filters
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      {children}
    </label>
  );
}
