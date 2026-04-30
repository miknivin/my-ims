import Button from "../../ui/button/Button";
import ComponentCard from "../../common/ComponentCard";
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
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-4 py-4 dark:border-gray-800">
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

