import { useMemo, useState } from "react";
import { Trash2, X } from "lucide-react";
import { Modal } from "@/shared/components/ui/modal";
import Button from "@/shared/components/ui/button/Button";
import TransactionSectionCard from "./TransactionSectionCard";
import { TransactionLineColumnDefinition } from "./transactionLineItems";
import { loadColumnPrefs, saveColumnPrefs } from "./columnPreferences";

const ACTION_COLUMN_WIDTH = 90;
const INDEX_COLUMN_WIDTH = 55;

interface TransactionLineItemsSectionProps<
  TLine,
  TContext,
  TKey extends string = string,
> {
  lines: TLine[];
  columns: TransactionLineColumnDefinition<TLine, TContext, TKey>[];
  defaultSelectedColumns: TKey[];
  createDefaultColumnWidths: () => Record<TKey, number>;
  getRowId: (line: TLine) => string;
  getCellContext: (line: TLine) => TContext;
  onAddLine: () => void;
  onRemoveLine: (line: TLine) => void;
  sectionTitle?: string;
  columnPickerTitle?: string;
  columnPickerDescription: string;
  showAddButton?: boolean;
  addLineLabel?: string;
  removeLineLabel?: string;
  storageKey?: string;
}

function TransactionLineItemRow<TLine, TContext, TKey extends string = string>({
  displayIndex,
  line,
  columns,
  templateColumns,
  getCellContext,
  onRemove,
  removeLabel,
}: {
  displayIndex: number;
  line: TLine;
  columns: TransactionLineColumnDefinition<TLine, TContext, TKey>[];
  templateColumns: string;
  getCellContext: (line: TLine) => TContext;
  onRemove: (line: TLine) => void;
  removeLabel: string;
}) {
  return (
    <div
      className="grid border-b border-gray-100 dark:border-white/[0.05]"
      style={{ gridTemplateColumns: templateColumns }}
    >
      <div className="flex items-center overflow-hidden border-r border-gray-100 px-3 py-3 text-xs text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
        <span className="block truncate">{displayIndex}</span>
      </div>

      {columns.map((column) => (
        <div
          key={column.key}
          className="overflow-hidden border-r border-gray-100 px-1 py-2 dark:border-white/[0.05]"
        >
          {column.renderCell(getCellContext(line))}
        </div>
      ))}

      <div className="flex items-center justify-center overflow-hidden px-2 py-2">
        <button
          type="button"
          onClick={() => onRemove(line)}
          aria-label={removeLabel}
          className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function TransactionLineItemsSection<
  TLine,
  TContext,
  TKey extends string = string,
>({
  lines,
  columns,
  defaultSelectedColumns,
  createDefaultColumnWidths,
  getRowId,
  getCellContext,
  onAddLine,
  onRemoveLine,
  sectionTitle = "Line Items",
  columnPickerTitle = "Choose Line Columns",
  columnPickerDescription,
  showAddButton = true,
  addLineLabel = "Add Line",
  removeLineLabel = "Remove",
  storageKey,
}: TransactionLineItemsSectionProps<TLine, TContext, TKey>) {
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<TKey[]>(() => {
    if (storageKey) {
      const saved = loadColumnPrefs(storageKey);
      if (saved && saved.selected.length > 0) {
        // Only auto-add columns that are new (not known when prefs were last saved)
        // and are default-selected. Never re-add columns the user explicitly removed.
        const newDefaults = defaultSelectedColumns.filter(
          (k) => !saved.known.includes(k as string),
        );
        return [...saved.selected, ...newDefaults] as TKey[];
      }
    }
    return defaultSelectedColumns;
  });
  const [columnWidths, setColumnWidths] = useState(createDefaultColumnWidths);
  const [sortState, setSortState] = useState<{
    key: TKey;
    direction: "asc" | "desc";
  } | null>(null);

  const visibleColumns = useMemo(
    () => columns.filter((column) => selectedColumns.includes(column.key)),
    [columns, selectedColumns],
  );

  const sortedItems = useMemo(() => {
    if (!sortState) {
      return lines;
    }

    const sortColumn = columns.find((column) => column.key === sortState.key);
    if (!sortColumn) {
      return lines;
    }

    return [...lines].sort((left, right) => {
      const leftValue = sortColumn.getSortValue(left);
      const rightValue = sortColumn.getSortValue(right);

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return sortState.direction === "asc"
          ? leftValue - rightValue
          : rightValue - leftValue;
      }

      const result = String(leftValue).localeCompare(
        String(rightValue),
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        },
      );

      return sortState.direction === "asc" ? result : -result;
    });
  }, [columns, lines, sortState]);

  const gridTemplateColumns = useMemo(() => {
    const nextColumns = [
      `${INDEX_COLUMN_WIDTH}px`,
      ...visibleColumns.map((column) => `${columnWidths[column.key]}px`),
      `${ACTION_COLUMN_WIDTH}px`,
    ];

    return nextColumns.join(" ");
  }, [columnWidths, visibleColumns]);

  const startResize = (
    key: TKey,
    startX: number,
    startWidth: number,
    minWidth: number,
  ) => {
    const handleMouseMove = (event: MouseEvent) => {
      const delta = event.clientX - startX;
      setColumnWidths((current) => ({
        ...current,
        [key]: Math.max(minWidth, startWidth + delta),
      }));
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const toggleSort = (key: TKey) => {
    setSortState((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }

      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }

      return null;
    });
  };

  const getSortIndicator = (key: TKey) => {
    if (!sortState || sortState.key !== key) {
      return <span className="text-[11px] text-gray-400">↕</span>;
    }

    return sortState.direction === "asc" ? (
      <span className="text-[11px] text-brand-500">↑</span>
    ) : (
      <span className="text-[11px] text-brand-500">↓</span>
    );
  };

  return (
    <TransactionSectionCard title={sectionTitle}>
      <div className="mb-4 flex items-center justify-end gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsColumnModalOpen(true)}
          >
            Columns
          </Button>
          {showAddButton ? (
            <Button type="button" size="sm" onClick={onAddLine}>
              {addLineLabel}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/[0.05]">
        <div className="min-w-max">
          <div
            className="grid border-b border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-gray-400"
            style={{ gridTemplateColumns }}
          >
            <div className="flex items-center overflow-hidden border-r border-gray-200 px-3 py-3 dark:border-white/[0.05]">
              <span className="block truncate">Row</span>
            </div>
            {visibleColumns.map((column) => (
              <div
                key={column.key}
                className="relative flex items-center overflow-hidden border-r border-gray-200 px-3 py-3 dark:border-white/[0.05]"
              >
                <button
                  type="button"
                  onClick={() => toggleSort(column.key)}
                  className="flex min-w-0 items-center gap-1 overflow-hidden text-left transition hover:text-gray-700 dark:hover:text-white/90"
                >
                  <span className="truncate">{column.label}</span>
                  <span className="shrink-0">
                    {getSortIndicator(column.key)}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`Resize ${column.label}`}
                  onMouseDown={(event) =>
                    startResize(
                      column.key,
                      event.clientX,
                      columnWidths[column.key],
                      column.minWidth,
                    )
                  }
                  className="absolute right-0 top-0 h-full w-2 cursor-col-resize opacity-0 transition hover:opacity-100 focus:opacity-100"
                >
                  <span className="mx-auto block h-full w-px bg-gray-300 dark:bg-gray-600" />
                </button>
              </div>
            ))}
            <div className="flex items-center justify-center overflow-hidden px-3 py-3">
              <span className="block truncate">Action</span>
            </div>
          </div>

          {sortedItems.map((line, index) => (
            <TransactionLineItemRow
              key={getRowId(line)}
              displayIndex={index + 1}
              line={line}
              columns={visibleColumns}
              templateColumns={gridTemplateColumns}
              getCellContext={getCellContext}
              onRemove={onRemoveLine}
              removeLabel={removeLineLabel}
            />
          ))}
        </div>
      </div>

      <Modal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        className="max-w-2xl"
        showCloseButton={false}
      >
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex flex-shrink-0 items-start justify-between border-b border-gray-100 px-6 pb-4 pt-6 dark:border-white/[0.06]">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {columnPickerTitle}
              </h3>
              {columnPickerDescription && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {columnPickerDescription}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsColumnModalOpen(false)}
              className="ml-4 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {columns.map((column) => {
                const checked = selectedColumns.includes(column.key);
                const isOnlySelected = checked && selectedColumns.length === 1;

                return (
                  <label
                    key={column.key}
                    className="flex items-start gap-3 rounded-xl border border-gray-200 px-4 py-3 dark:border-white/[0.05]"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                      checked={checked}
                      disabled={isOnlySelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setSelectedColumns((current) => {
                            const next = [...current, column.key];
                            if (storageKey) saveColumnPrefs(storageKey, next, columns.map((c) => c.key as string));
                            return next;
                          });
                          return;
                        }

                        setSelectedColumns((current) => {
                          const next = current.filter(
                            (key) => key !== column.key,
                          );
                          if (storageKey) saveColumnPrefs(storageKey, next, columns.map((c) => c.key as string));
                          return next;
                        });
                      }}
                    />
                    <span>
                      <span className="block text-sm font-medium text-gray-800 dark:text-white/90">
                        {column.label}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                        {column.nature === "readonly"
                          ? "Read-only"
                          : column.nature === "lookup"
                            ? "Lookup input"
                            : column.nature === "select"
                              ? "Select input"
                              : "Editable input"}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex flex-shrink-0 justify-end border-t border-gray-100 px-6 py-4 dark:border-white/[0.06]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsColumnModalOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </TransactionSectionCard>
  );
}
