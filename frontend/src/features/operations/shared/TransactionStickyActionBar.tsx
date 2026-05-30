import { useEffect, useRef, useState } from "react";
import Button from "@/shared/components/ui/button/Button";

interface TransactionStickyActionBarProps {
  isSaving: boolean;
  primaryLabel: string;
  draftLabel?: string;
  onDraft?: () => void;
  onReset: () => void;
  onCancel: () => void;
}

function ActionButtons({
  isSaving,
  primaryLabel,
  draftLabel = "Draft",
  onDraft,
  onReset,
  onCancel,
}: TransactionStickyActionBarProps) {
  return (
    <>
      <Button type="button" variant="outline" onClick={onCancel}>
        Back
      </Button>
      <Button type="button" variant="outline" onClick={onReset}>
        Reset
      </Button>
      {onDraft ? (
        <Button
          type="button"
          variant="outline"
          onClick={onDraft}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : draftLabel}
        </Button>
      ) : null}
      <Button className="min-w-32" disabled={isSaving}>
        {isSaving ? "Saving..." : primaryLabel}
      </Button>
    </>
  );
}

export default function TransactionStickyActionBar(
  props: TransactionStickyActionBarProps
) {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    if (!anchorRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 1 }
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
