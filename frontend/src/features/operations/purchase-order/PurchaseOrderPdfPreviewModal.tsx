import { useEffect } from "react";
import { X } from "lucide-react";

interface PurchaseOrderPdfPreviewModalProps {
  url: string | null;
  onClose: () => void;
}

export default function PurchaseOrderPdfPreviewModal({
  url,
  onClose,
}: PurchaseOrderPdfPreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!url) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/[0.08]">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Purchase Order Preview
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/[0.08] dark:hover:text-gray-300"
            aria-label="Close preview"
          >
            <X size={18} />
          </button>
        </div>
        <iframe
          src={url}
          title="PDF Preview"
          className="flex-1 w-full"
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
}
