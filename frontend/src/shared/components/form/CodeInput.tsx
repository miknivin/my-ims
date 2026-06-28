import { useLazyGetNextCodeQuery } from "@/redux/api/codeGeneratorApi";

interface CodeInputProps {
  entity: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export default function CodeInput({
  entity,
  value,
  onChange,
  label,
  required = false,
  placeholder = "Auto-generate or type",
  disabled = false,
}: CodeInputProps) {
  const [fetchNextCode, { isFetching }] = useLazyGetNextCodeQuery();

  const handleGenerate = async () => {
    const result = await fetchNextCode({ entity });
    if (result.data?.code) onChange(result.data.code);
  };

  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
            {label}
            {required && <span className="text-error-500">*</span>}
          </label>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isFetching || disabled}
            className="text-xs text-brand-500 hover:text-brand-600 disabled:opacity-40 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {isFetching ? "Generating..." : "Generate"}
          </button>
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
      />
    </div>
  );
}
