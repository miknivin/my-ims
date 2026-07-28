import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, FileText } from "lucide-react";
import Button from "@/shared/components/ui/button/Button";

interface TransactionStickyActionBarProps {
  isSaving: boolean;
  primaryLabel: string;
  draftLabel?: string;
  onDraft?: () => void;
  onReset: () => void;
  onCancel: () => void;
  onPreview?: () => void;
  isPreviewing?: boolean;
  onDownload?: () => void;
  isDownloading?: boolean;
}

function SplitSaveButton({
  isSaving,
  primaryLabel,
  draftLabel = "Save as Draft",
  onDraft,
}: {
  isSaving: boolean;
  primaryLabel: string;
  draftLabel?: string;
  onDraft?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!onDraft) {
    return (
      <Button className="min-w-32" disabled={isSaving}>
        {isSaving ? "Saving..." : primaryLabel}
      </Button>
    );
  }

  return (
    <div ref={ref} className="relative flex">
      <Button
        className="min-w-28 rounded-r-none border-r border-brand-600"
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : primaryLabel}
      </Button>
      <button
        type="button"
        disabled={isSaving}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center rounded-r-lg bg-brand-500 px-2 text-white transition hover:bg-brand-600 disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
        aria-label="More save options"
      >
        <ChevronDown size={14} />
      </button>

      {open ? (
        <div className="absolute bottom-full right-0 mb-1 min-w-[140px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-white/[0.08] dark:bg-gray-900">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              setOpen(false);
              onDraft();
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-white/[0.05]"
          >
            {draftLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ActionButtons({
  isSaving,
  primaryLabel,
  draftLabel,
  onDraft,
  onReset,
  onCancel,
  onPreview,
  isPreviewing,
  onDownload,
  isDownloading,
}: TransactionStickyActionBarProps) {
  return (
    <>
      <Button type="button" variant="outline" onClick={onCancel}>
        Back
      </Button>
      <Button type="button" variant="outline" onClick={onReset}>
        Reset
      </Button>
      {onDownload ? (
        <Button
          type="button"
          variant="outline"
          onClick={onDownload}
          disabled={isDownloading}
        >
          <Download size={14} className="mr-1.5" />
          {isDownloading ? "Downloading..." : "Download PDF"}
        </Button>
      ) : null}
      {onPreview ? (
        <Button
          type="button"
          variant="outline"
          onClick={onPreview}
          disabled={isPreviewing}
        >
          <FileText size={14} className="mr-1.5" />
          {isPreviewing ? "Generating..." : "Preview PDF"}
        </Button>
      ) : null}
      <SplitSaveButton
        isSaving={isSaving}
        primaryLabel={primaryLabel}
        draftLabel={draftLabel}
        onDraft={onDraft}
      />
    </>
  );
}

export default function TransactionStickyActionBar(
  props: TransactionStickyActionBarProps,
) {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    if (!anchorRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 1 },
    );
    observer.observe(anchorRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={anchorRef}
        className="flex items-center justify-end gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 dark:border-white/[0.05] dark:bg-gray-900"
      >
        <ActionButtons {...props} />
      </div>

      {showSticky ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-4">
          <div className="mx-auto flex max-w-[1680px] justify-end">
            <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-white/[0.05] dark:bg-gray-900">
              <ActionButtons {...props} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
