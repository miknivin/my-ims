import { useEffect, useRef, useState } from "react";
import Button from "@/shared/components/ui/button/Button";
import ComponentCard from "@/shared/components/common/ComponentCard";
import AccountingSettingsSection from "./AccountingSettingsSection";
import GeneralSettingsSection from "./GeneralSettingsSection";
import InventorySettingsSection from "./InventorySettingsSection";
import {
  SettingsFormProvider,
  type SettingsTabKey,
  useSettingsForm,
} from "./SettingsFormContext";

const tabs: Array<{ key: SettingsTabKey; label: string }> = [
  { key: "general", label: "General" },
  { key: "inventory", label: "Inventory Settings" },
  { key: "accounting", label: "Accounting Settings" },
];

function SettingsFormContent() {
  const {
    activeTab,
    setActiveTab,
    isLoading,
    isFetching,
    isSaving,
    isDirty,
    message,
    errorMessage,
    handleReset,
    handleSave,
  } = useSettingsForm();

  const sentinelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isFixedRef = useRef(false);
  const [isFixed, setIsFixed] = useState(false);
  const [fixedStyle, setFixedStyle] = useState<React.CSSProperties>({});
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const header = headerRef.current;
    if (!sentinel || !header) return;

    const getNavbarHeight = () =>
      document.querySelector("header")?.offsetHeight ?? 0;

    const recalcFixedStyle = () => {
      const parent = header.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        setFixedStyle({ top: getNavbarHeight(), left: rect.left, width: rect.width });
      }
      setHeaderHeight(header.offsetHeight);
    };

    const handleScroll = () => {
      const navbarHeight = getNavbarHeight();
      const sentinelTop = sentinel.getBoundingClientRect().top;
      const shouldFix = sentinelTop < navbarHeight;
      if (shouldFix === isFixedRef.current) return;
      isFixedRef.current = shouldFix;
      if (shouldFix) {
        recalcFixedStyle();
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  if (isLoading) {
    return (
      <ComponentCard title="" className="p-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Loading settings...
        </div>
      </ComponentCard>
    );
  }

  return (
    <div className="space-y-6">
      <ComponentCard title="" className="p-0">
        <div ref={sentinelRef} />
        <div
          ref={headerRef}
          className={`z-50 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900 ${
            isFixed ? "fixed shadow-md" : "rounded-t-2xl"
          }`}
          style={isFixed ? fixedStyle : undefined}
        >
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-500 text-white shadow-theme-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isFetching ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">Refreshing...</span>
            ) : null}
            <Button type="button" variant="outline" onClick={handleReset} disabled={!isDirty || isSaving}>
              Reset
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving || !isDirty}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
        {isFixed ? <div style={{ height: headerHeight }} /> : null}
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          {message ? (
            <div className="mb-4 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700 dark:border-success-900/40 dark:bg-success-950/20 dark:text-success-400">
              {message}
            </div>
          ) : null}
          {errorMessage ? (
            <div className="mb-4 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-950/20 dark:text-error-400">
              {errorMessage}
            </div>
          ) : null}

          {activeTab === "general" ? <GeneralSettingsSection /> : null}
          {activeTab === "inventory" ? <InventorySettingsSection /> : null}
          {activeTab === "accounting" ? <AccountingSettingsSection /> : null}
        </div>
      </ComponentCard>
    </div>
  );
}

export default function SettingsForm() {
  return (
    <SettingsFormProvider>
      <SettingsFormContent />
    </SettingsFormProvider>
  );
}

