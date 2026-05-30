export const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const checkboxClass =
  "h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500";

export function ToggleField({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800 ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className={checkboxClass}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <span className="block text-sm font-medium text-gray-800 dark:text-white/90">
          {label}
        </span>
        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
          {description}
        </span>
      </span>
    </label>
  );
}
