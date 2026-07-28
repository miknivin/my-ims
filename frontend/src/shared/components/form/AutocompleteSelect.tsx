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
  selectedKey?: string | null;
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
  selectedKey,
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const requestIdRef = useRef(0);
  const searchRef = useRef(search);
  const getItemsRef = useRef(getItems);
  const skipNextSearchRef = useRef(false);
  const selectedLabelRef = useRef<string | null>(null);
  const suppressSearchUntilInputChangeRef = useRef(false);
  const externalValueRef = useRef(true);

  useEffect(() => {
    searchRef.current = search;
    getItemsRef.current = getItems;
  }, [getItems, search]);

  // Reset highlight when options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [options]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  useEffect(() => {
    setInputValue((current) => {
      if (current === value) return current;
      // current !== value → parent changed value externally (edit load, reset).
      // Mark as externally set so search stays suppressed until user types.
      externalValueRef.current = true;
      if (selectedKey === undefined && selectedLabelRef.current !== value) {
        selectedLabelRef.current = null;
      }
      return value;
    });
  }, [value, selectedKey]);

  const updateDropdownPosition = () => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      zIndex: 999999,
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
    // Confirmed check: externally-set value, selectedKey prop, or ref-based legacy logic.
    const isConfirmed = externalValueRef.current ||
      (selectedKey !== undefined
        ? Boolean(selectedKey)
        : suppressSearchUntilInputChangeRef.current || selectedLabelRef.current === inputValue);
    if (isConfirmed) {
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
  }, [debounceMs, disabled, inputValue, minChars, selectedKey]);

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
    externalValueRef.current = false;
    suppressSearchUntilInputChangeRef.current = false;
    selectedLabelRef.current = null;
    setInputValue(nextValue);
    onInputChange?.(nextValue);
    onSelect(null);
  };

  const handleSelect = (item: TItem) => {
    const label = getOptionLabel(item);
    requestIdRef.current += 1;
    externalValueRef.current = false;
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || options.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((current) =>
        current < options.length - 1 ? current + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((current) =>
        current > 0 ? current - 1 : options.length - 1,
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(options[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const trimmedInputValue = inputValue.trim();

  const addButton =
    onNoMatchClick && trimmedInputValue.length >= minChars ? (
      <button
        type="button"
        onClick={() => {
          onNoMatchClick(trimmedInputValue);
          setIsOpen(false);
        }}
        className="flex w-full items-center gap-1.5 border-t border-gray-100 px-4 py-2.5 text-left text-sm font-semibold text-white transition bg-brand-500 hover:bg-brand-600 dark:border-white/[0.06]"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add &quot;{trimmedInputValue}&quot;
      </button>
    ) : null;

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
        <>
          <ul ref={listRef} className="max-h-64 overflow-y-auto py-2">
            {options.map((item, index) => (
              <li key={getOptionKey(item)}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`block w-full px-4 py-2.5 text-left text-sm text-gray-700 transition dark:text-gray-200 ${
                    index === highlightedIndex
                      ? "bg-gray-100 dark:bg-white/[0.06]"
                      : "hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                  }`}
                >
                  {getOptionLabel(item)}
                </button>
              </li>
            ))}
          </ul>
          {addButton}
        </>
      ) : (
        <div className="px-4 py-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {noResultsText}
          </p>
          {addButton && <div className="mt-1">{addButton}</div>}
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
        onKeyDown={handleKeyDown}
        onFocus={() => {
          const isConfirmed = externalValueRef.current ||
            (selectedKey !== undefined
              ? Boolean(selectedKey)
              : suppressSearchUntilInputChangeRef.current || selectedLabelRef.current === inputValue);
          if (options.length > 0 && !isConfirmed) {
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
