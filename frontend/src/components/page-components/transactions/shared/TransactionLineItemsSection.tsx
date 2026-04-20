import { useMemo, useState } from "react";
import { Modal } from "../../../ui/modal";
import Button from "../../../ui/button/Button";
import TransactionSectionCard from "./TransactionSectionCard";
import { TransactionLineColumnDefinition } from "./transactionLineItems";

const ACTION_COLUMN_WIDTH = 100;
const INDEX_COLUMN_WIDTH = 80;

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
      <div className="flex items-center overflow-hidden px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="block truncate">{displayIndex}</span>
      </div>

      {columns.map((column) => (
        <div key={column.key} className="overflow-hidden px-1 py-2">
          {column.renderCell(getCellContext(line))}
        </div>
      ))}

      <div className="flex items-center justify-center overflow-hidden px-2 py-2">
        <button
          type="button"
          onClick={() => onRemove(line)}
          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          {removeLabel}
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
}: TransactionLineItemsSectionProps<TLine, TContext, TKey>) {
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<TKey[]>(
    defaultSelectedColumns,
  );
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
      return "<>";
    }

    return sortState.direction === "asc" ? "^" : "v";
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
            <div className="flex items-center overflow-hidden px-3 py-3">
              <span className="block truncate">Row</span>
            </div>
            {visibleColumns.map((column) => (
              <div
                key={column.key}
                className="relative flex items-center overflow-hidden px-3 py-3"
              >
                <button
                  type="button"
                  onClick={() => toggleSort(column.key)}
                  className="flex min-w-0 items-center gap-1 overflow-hidden text-left transition hover:text-gray-700 dark:hover:text-white/90"
                >
                  <span className="truncate">{column.label}</span>
                  <span className="shrink-0 text-[10px]">
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
        className="max-h-[90vh] max-w-2xl overflow-y-auto p-6"
      >
        <div className="space-y-5">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {columnPickerTitle}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {columnPickerDescription}
            </p>
          </div>

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
                        setSelectedColumns((current) => [
                          ...current,
                          column.key,
                        ]);
                        return;
                      }

                      setSelectedColumns((current) =>
                        current.filter((key) => key !== column.key),
                      );
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

          <div className="flex justify-end">
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
