interface PaginationControlsProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function PaginationControls({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: PaginationControlsProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 border-t border-gray-100 px-5 py-4 text-sm text-gray-600 dark:border-white/[0.05] dark:text-gray-300 lg:flex-row lg:items-center">
      <div>
        Showing {total === 0 ? 0 : (page - 1) * limit + 1} to{" "}
        {Math.min(page * limit, total)} of {total} records
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          {[10, 20, 50, 100].map((option) => (
            <option key={option} value={option}>
              {option} / page
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700"
        >
          Previous
        </button>

        <span>
          Page {totalPages === 0 ? 0 : page} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={totalPages === 0 || page >= totalPages}
          className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
