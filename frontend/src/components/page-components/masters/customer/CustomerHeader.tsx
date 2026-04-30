import Button from "../../../ui/button/Button";

interface CustomerHeaderProps {
  onAdd: () => void;
  onFilter: () => void;
  hasActiveFilters?: boolean;
}

export default function CustomerHeader({
  onAdd,
  onFilter,
  hasActiveFilters = false,
}: CustomerHeaderProps) {
  return (
    <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center lg:gap-0">
      <div className="flex flex-wrap-reverse items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button
            onClick={onFilter}
            size="sm"
            variant="outline"
            className={hasActiveFilters ? "ring-brand-300 text-brand-600 dark:ring-brand-800 dark:text-brand-300" : ""}
            startIcon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 3H14L9.5 8.25V13L6.5 11.25V8.25L2 3Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          >
            Filter
          </Button>
          <Button onClick={onAdd} size="sm" variant="primary">
            Add +
          </Button>
        </div>
      </div>
    </div>
  );
}
