import { Pencil, Trash2 } from "lucide-react";

interface MasterTableActionsProps {
  editLabel?: string;
  deleteLabel?: string;
  isDeleting?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MasterTableActions({
  editLabel = "Edit",
  deleteLabel = "Delete",
  isDeleting = false,
  onEdit,
  onDelete,
}: MasterTableActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={editLabel}
        title={editLabel}
        onClick={onEdit}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label={deleteLabel}
        title={deleteLabel}
        onClick={onDelete}
        disabled={isDeleting}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
