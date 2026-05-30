interface FilterChip {
  key: string;
  label: string;
  value: string;
}

interface AppliedFilterChipsProps {
  chips: FilterChip[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export default function AppliedFilterChips({
  chips,
  onRemove,
  onClearAll,
}: AppliedFilterChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip.key)}
          className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100 dark:border-brand-800/60 dark:bg-brand-500/10 dark:text-brand-300"
        >
          <span>{chip.label}: {chip.value}</span>
          <span aria-hidden="true">x</span>
        </button>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        Clear all
      </button>
    </div>
  );
}
