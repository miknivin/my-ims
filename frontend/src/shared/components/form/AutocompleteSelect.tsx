import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  value: SearchResult<TResult>,
): value is { unwrap: () => Promise<TResult> } {
  return Boolean(
    value &&
    typeof value === "object" &&
    "unwrap" in value &&
    typeof value.unwrap === "function",
  );
}

async function resolveSearchResult<TResult>(
  value: SearchResult<TResult>,
): Promise<TResult> {
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
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const requestIdRef = useRef(0);
  const searchRef = useRef(search);
  const getItemsRef = useRef(getItems);
  const skipNextSearchRef = useRef(false);
  const selectedLabelRef = useRef<string | null>(null);
  const suppressSearchUntilInputChangeRef = useRef(false);

  useEffect(() => {
    searchRef.current = search;
    getItemsRef.current = getItems;
  }, [getItems, search]);

  useEffect(() => {
    setInputValue((current) => {
      if (current === value) {
        return current;
      }

      if (selectedLabelRef.current !== value) {
        selectedLabelRef.current = null;
      }

      return value;
    });
  }, [value]);

  const updateDropdownPosition = () => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !dropdownRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleReposition = () => updateDropdownPosition();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isOpen]);

  useEffect(() => {
    const keyword = inputValue.trim();
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }
    if (
      suppressSearchUntilInputChangeRef.current ||
      selectedLabelRef.current === inputValue
    ) {
      setOptions((current) => (current.length === 0 ? current : []));
      setIsOpen(false);
      setIsLoading(false);
      return;
    }
    if (disabled || keyword.length < minChars) {
      setOptions((current) => (current.length === 0 ? current : []));
      setIsOpen(false);
      setIsLoading(false);
      return;
    }
    const currentRequestId = ++requestIdRef.current;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const resolved = await resolveSearchResult(searchRef.current(keyword));
        if (requestIdRef.current !== currentRequestId) return;
        const items = getItemsRef.current(resolved) ?? [];
        setOptions(items);
        updateDropdownPosition();
        setIsOpen(true);
      } catch {
        if (requestIdRef.current === currentRequestId) {
          setOptions([]);
          updateDropdownPosition();
          setIsOpen(true);
        }
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false);
        }
      }
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [debounceMs, disabled, inputValue, minChars]);

  const inputClasses = useMemo(
    () =>
      `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
        disabled
          ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-500 opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          : "border-gray-300 bg-transparent text-gray-800 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800"
      } ${className}`,
    [className, disabled],
  );

  const handleChange = (nextValue: string) => {
    suppressSearchUntilInputChangeRef.current = false;
    selectedLabelRef.current = null;
    setInputValue(nextValue);
    onInputChange?.(nextValue);
    onSelect(null);
  };

  const handleSelect = (item: TItem) => {
    const label = getOptionLabel(item);
    requestIdRef.current += 1;
    suppressSearchUntilInputChangeRef.current = true;
    selectedLabelRef.current = label;
    skipNextSearchRef.current = true;
    setInputValue(label);
    onInputChange?.(label);
    onSelect(item);
    setIsOpen(false);
    setOptions([]);
    inputRef.current?.blur();
  };

  const trimmedInputValue = inputValue.trim();

  const dropdown = isOpen ? (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-white/[0.06] dark:bg-gray-900"
    >
      {isLoading ? (
        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
          Searching...
        </div>
      ) : options.length > 0 ? (
        <ul className="max-h-72 overflow-y-auto py-2">
          {options.map((item) => (
            <li key={getOptionKey(item)}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/[0.06]"
              >
                {getOptionLabel(item)}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {noResultsText}
          </p>
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
  ) : null;

  return (
    <div className="relative" ref={containerRef}>
      {isLoading ? (
        <div className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-brand-500 dark:text-brand-400">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M22 12a10 10 0 0 0-10-10v3a7 7 0 0 1 7 7h3Z"
            />
          </svg>
        </div>
      ) : null}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => {
          if (
            options.length > 0 &&
            !suppressSearchUntilInputChangeRef.current &&
            selectedLabelRef.current !== inputValue
          ) {
            updateDropdownPosition();
            setIsOpen(true);
          }
        }}
        className={`${inputClasses} ${isLoading ? "pr-10" : ""}`}
      />
      {createPortal(dropdown, document.body)}
    </div>
  );
}
