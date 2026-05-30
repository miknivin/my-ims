import { ReactNode, useEffect, useMemo, useState } from "react";
import TransactionSectionCard from "./TransactionSectionCard";

export interface TransactionSummaryTab {
  key: string;
  label: string;
  content: ReactNode;
}

export interface TransactionSummaryMetric {
  key: string;
  label: string;
  value?: string;
  content?: ReactNode;
}

const metricClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function TransactionSummarySection({
  tabs,
  metrics,
}: {
  tabs: TransactionSummaryTab[];
  metrics: TransactionSummaryMetric[];
}) {
  const [activeTabKey, setActiveTabKey] = useState(tabs[0]?.key ?? "");

  useEffect(() => {
    if (!tabs.some((tab) => tab.key === activeTabKey)) {
      setActiveTabKey(tabs[0]?.key ?? "");
    }
  }, [activeTabKey, tabs]);

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.key === activeTabKey) ?? tabs[0],
    [activeTabKey, tabs],
  );

  return (
    <TransactionSectionCard title="Summary">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab?.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTabKey(tab.key)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-500 text-white shadow-sm"
                      : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-gray-200 p-4 dark:border-white/[0.05]">
            {activeTab?.content}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <div key={metric.key}>
              <label className={labelClass}>{metric.label}</label>
              {metric.content ?? (
                <input className={metricClass} value={metric.value ?? ""} readOnly />
              )}
            </div>
          ))}
        </div>
      </div>
    </TransactionSectionCard>
  );
}
