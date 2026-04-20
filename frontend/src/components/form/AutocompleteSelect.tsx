import { useEffect, useMemo, useRef, useState } from "react";

type SearchResult<TResult> =
  | TResult
  | Promise<TResult>
  | {
      unwrap?: () => Promise<TResult>;
    };

interface AutocompleteSelectProps<TItem, TResult> {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  debounceMs?: number;
  minChars?: number;
  noResultsText?: string;
  search: (keyword: string) => SearchResult<TResult>;
  getItems: (result: TResult) => TItem[];
  getOptionKey: (item: TItem) => string;
  getOptionLabel: (item: TItem) => string;
  onInputChange?: (value: string) => void;
  onNoMatchClick?: (keyword: string) => void;
  onSelect: (item: TItem | null) => void;
}

function isUnwrappable<TResult>(
  value: SearchResult<TResult>
): value is { unwrap: () => Promise<TResult> } {
  return Boolean(value && typeof value === "object" && "unwrap" in value && typeof value.unwrap === "function");
}

async function resolveSearchResult<TResult>(value: SearchResult<TResult>): Promise<TResult> {
  if (isUnwrappable(value)) {
    return value.unwrap();
  }

  return (await Promise.resolve(value)) as TResult;
}

export default function AutocompleteSelect<TItem, TResult>({
  value = "",
  placeholder = "Search...",
  disabled = false,
  className = "",
  debounceMs = 350,
  minChars = 1,
  noResultsText = "No matching results found.",
  search,
  getItems,
  getOptionKey,
  getOptionLabel,
  onInputChange,
  onNoMatchClick,
  onSelect,
}: AutocompleteSelectProps<TItem, TResult>) {
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<TItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const keyword = inputValue.trim();

    if (disabled || keyword.length < minChars) {
      setOptions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const resolved = await resolveSearchResult(search(keyword));

        if (requestIdRef.current !== currentRequestId) {
          return;
        }

        const items = getItems(resolved) ?? [];
        setOptions(items);
        setIsOpen(true);
      } catch {
        if (requestIdRef.current === currentRequestId) {
          setOptions([]);
          setIsOpen(true);
        }
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [debounceMs, disabled, getItems, inputValue, minChars, search]);

  const inputClasses = useMemo(
    () =>
      `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
        disabled
          ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-500 opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          : "border-gray-300 bg-transparent text-gray-800 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800"
      } ${className}`,
    [className, disabled]
  );

  const handleChange = (nextValue: string) => {
    setInputValue(nextValue);
    onInputChange?.(nextValue);
    onSelect(null);
  };

  const handleSelect = (item: TItem) => {
    const label = getOptionLabel(item);
    setInputValue(label);
    onInputChange?.(label);
    onSelect(item);
    setIsOpen(false);
  };

  const trimmedInputValue = inputValue.trim();

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => {
          if (options.length > 0) {
            setIsOpen(true);
          }
        }}
        className={inputClasses}
      />

      {isOpen ? (
        <div className="absolute z-20 mt-2 max-h-72 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-white/[0.06] dark:bg-gray-900">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
          ) : options.length > 0 ? (
            <ul className="max-h-72 overflow-y-auto py-2">
              {options.map((item) => (
                <li key={getOptionKey(item)}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/[0.06]"
                  >
                    {getOptionLabel(item)}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">{noResultsText}</p>
              {onNoMatchClick && trimmedInputValue.length >= minChars ? (
                <button
                  type="button"
                  onClick={() => {
                    onNoMatchClick(trimmedInputValue);
                    setIsOpen(false);
                  }}
                  className="mt-3 inline-flex items-center rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
                >
                  Add "{trimmedInputValue}"
                </button>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
