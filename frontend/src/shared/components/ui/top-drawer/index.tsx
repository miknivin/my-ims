import { ReactNode, useEffect } from "react";

interface TopDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxHeightClassName?: string;
}

export function TopDrawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxHeightClassName = "max-h-[82vh]",
}: TopDrawerProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-99999">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
      />

      <section
        className={`absolute left-0 right-0 top-0 overflow-hidden border-b border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 ${maxHeightClassName}`}
      >
        <div className="mx-auto flex w-full max-w-[1680px] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-4 dark:border-gray-800 md:px-6">
            {title ? (
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 5L15 15M15 5L5 15"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.8"
                />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto px-4 py-5 md:px-6">{children}</div>

          {footer ? (
            <div className="border-t border-gray-100 px-4 py-4 dark:border-gray-800 md:px-6">
              {footer}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
