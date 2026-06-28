import { LookupOption } from "@/shared/types/filtering";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import Button from "@/shared/components/ui/button/Button";

export interface JournalEntryFilterValues {
  keyword: string;
  fromDate: string;
  toDate: string;
  ledgerId: string;
  ledgerName: string;
  source: string;
  status: string;
  sortBy: string;
}

interface JournalEntryFilterFormProps {
  values: JournalEntryFilterValues;
  sourceOptions: string[];
  statusOptions: string[];
  sortOptions: Array<{ value: string; label: string }>;
  onChange: (values: Partial<JournalEntryFilterValues>) => void;
  onApply: () => void;
  onClear: () => void;
  searchLedgers: (
    keyword: string,
  ) =>
    | LookupOption[]
    | Promise<LookupOption[]>
    | { unwrap?: () => Promise<LookupOption[]> };
}

export default function JournalEntryFilterForm({
  values,
  sourceOptions,
  statusOptions,
  sortOptions,
  onChange,
  onApply,
  onClear,
  searchLedgers,
}: JournalEntryFilterFormProps) {
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
            placeholder="Voucher, ledger, narration"
            className={inputClass}
          />
        </Field>

        <Field label="From Date">
          <input
            type="date"
            value={values.fromDate}
            max={values.toDate || undefined}
            onChange={(event) => handleFromDateChange(event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="To Date">
          <input
            type="date"
            value={values.toDate}
            min={values.fromDate || undefined}
            onChange={(event) => handleToDateChange(event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Ledger">
          <AutocompleteSelect<LookupOption, LookupOption[]>
            value={values.ledgerName}
            placeholder="Search ledger"
            search={searchLedgers}
            getItems={(result) => result}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) =>
              item.secondaryLabel
                ? `${item.label} (${item.secondaryLabel})`
                : item.label
            }
            onInputChange={(value) =>
              onChange({ ledgerName: value, ledgerId: "" })
            }
            onSelect={(item) =>
              onChange({
                ledgerId: item?.id ?? "",
                ledgerName: item
                  ? item.secondaryLabel
                    ? `${item.label} (${item.secondaryLabel})`
                    : item.label
                  : "",
              })
            }
          />
        </Field>

        <Field label="Source">
          <select
            value={values.source}
            onChange={(event) => onChange({ source: event.target.value })}
            className={inputClass}
          >
            <option value="">All</option>
            {sourceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status">
          <select
            value={values.status}
            onChange={(event) => onChange({ status: event.target.value })}
            className={inputClass}
          >
            <option value="">All</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Sort By">
          <select
            value={values.sortBy}
            onChange={(event) => onChange({ sortBy: event.target.value })}
            className={inputClass}
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
        <Button type="submit">Apply Filters</Button>
      </div>
    </form>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

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
