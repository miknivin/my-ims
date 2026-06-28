import Button from "@/shared/components/ui/button/Button";

export interface TrialBalanceFilterValues {
  showZeroBalances: boolean;
}

interface Props {
  values: TrialBalanceFilterValues;
  onChange: (v: Partial<TrialBalanceFilterValues>) => void;
  onApply: () => void;
  onClear: () => void;
}

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
