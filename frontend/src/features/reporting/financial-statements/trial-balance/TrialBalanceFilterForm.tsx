import Button from "@/shared/components/ui/button/Button";

export interface TrialBalanceFilterValues {
  fromDate: string;
  toDate: string;
  showZeroBalances: boolean;
}

interface Props {
  values: TrialBalanceFilterValues;
  onChange: (v: Partial<TrialBalanceFilterValues>) => void;
  onApply: () => void;
  onClear: () => void;
}

const INPUT_CLASS =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function TrialBalanceFilterForm({
  values,
  onChange,
  onApply,
  onClear,
}: Props) {
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="From Date">
          <input
            type="date"
            value={values.fromDate}
            onChange={(e) => onChange({ fromDate: e.target.value })}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="To Date">
          <input
            type="date"
            value={values.toDate}
            onChange={(e) => onChange({ toDate: e.target.value })}
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={values.showZeroBalances}
          onChange={(e) => onChange({ showZeroBalances: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Show zero-balance accounts
        </span>
      </label>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      {children}
    </label>
  );
}
