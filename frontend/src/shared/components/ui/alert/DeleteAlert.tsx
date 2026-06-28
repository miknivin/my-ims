import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Button from "../button/Button";

interface DeleteAlertProps {
  open: boolean;
  name: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteAlert({ open, name, onConfirm, onCancel }: DeleteAlertProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setError("");
      setIsDeleting(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError("");
    try {
      await onConfirm();
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      setError(message ?? "Failed to delete. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/45 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-xl dark:border-white/[0.08] dark:bg-gray-900">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
              Delete {name}?
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
              This action cannot be undone. Are you sure you want to permanently delete{" "}
              <span className="font-medium text-gray-900 dark:text-white/90">{name}</span>?
            </p>
            {error && (
              <p className="mt-2 text-sm text-error-600 dark:text-error-400">{error}</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-lg bg-error-500 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-error-600 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
