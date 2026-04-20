import { useEffect, useState } from "react";
import AutocompleteSelect from "../form/AutocompleteSelect";
import { useLazySearchLookupQuery } from "../../app/api/lookupApi";
import { LookupOption, LookupSource, SelectFilterOption, SortOption } from "../../types/filtering";

type SelectFilterConfig = {
  key: string;
  label: string;
  type: "select";
  value: string;
  options: SelectFilterOption[];
};

type LookupFilterConfig = {
  key: string;
  label: string;
  type: "lookup";
  source: LookupSource;
  value: string;
  displayValue: string;
  placeholder?: string;
};

export type FilterFieldConfig = SelectFilterConfig | LookupFilterConfig;

interface ListFilterToolbarProps {
  keyword: string;
  sortBy: string;
  sortOptions: SortOption[];
  filters: FilterFieldConfig[];
  onKeywordChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onFilterChange: (key: string, value: string) => void;
  onLookupChange: (key: string, item: LookupOption | null) => void;
}

export default function ListFilterToolbar({
  keyword,
  sortBy,
  sortOptions,
  filters,
  onKeywordChange,
  onSortChange,
  onFilterChange,
  onLookupChange,
}: ListFilterToolbarProps) {
  const [searchLookup] = useLazySearchLookupQuery();
  const [keywordInput, setKeywordInput] = useState(keyword);

  useEffect(() => {
    setKeywordInput(keyword);
  }, [keyword]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (keywordInput !== keyword) {
        onKeywordChange(keywordInput);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [keyword, keywordInput, onKeywordChange]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(260px,1.3fr)_minmax(180px,0.7fr)]">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Search
          </label>
          <input
            type="text"
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            placeholder="Search by keyword..."
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filters.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {filter.label}
              </label>

              {filter.type === "select" ? (
                <select
                  value={filter.value}
                  onChange={(event) => onFilterChange(filter.key, event.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                >
                  <option value="">All</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <AutocompleteSelect<LookupOption, LookupOption[]>
                  value={filter.displayValue}
                  placeholder={filter.placeholder ?? `Search ${filter.label.toLowerCase()}`}
                  search={(keyword) =>
                    searchLookup({
                      source: filter.source,
                      keyword,
                      limit: 10,
                    })
                  }
                  getItems={(result) => result}
                  getOptionKey={(item) => item.id}
                  getOptionLabel={(item) =>
                    item.secondaryLabel ? `${item.label} (${item.secondaryLabel})` : item.label
                  }
                  onSelect={(item) => onLookupChange(filter.key, item)}
                />
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
