import { useMemo } from "react";
import { Link, useLocation } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { AppNavLeaf, appNavItems } from "../../layout/navigation";

type OperationsGroup = {
  name: string;
  items?: AppNavLeaf[];
};

type OperationCard = {
  title: string;
  path: string;
  description: string;
  parentLabel?: string;
};

const operationDescriptions: Record<string, string> = {
  Orders:
    "Create and manage customer-facing and vendor-facing order documents.",
  Inventory:
    "Track receipts and stock movements that keep warehouse quantities accurate.",
  Adjustments:
    "Handle debit and credit note corrections for both sales and purchase flows.",
  Invoices:
    "Finalize commercial documents for purchases and sales with tax-ready totals.",
  Payments:
    "Record bill-wise receipts and supplier settlements against open invoices.",
  Purchase: "Purchase-side note adjustments linked back to vendor documents.",
  Sales: "Sales-side note adjustments linked back to customer invoices.",
  "Purchase Order":
    "Prepare and review purchase orders before stock or billing.",
  "Sales Order": "Capture customer demand before invoicing and fulfillment.",
  "Goods Receipt (GRN)":
    "Receive stock against supplier deliveries and validate incoming quantities.",
  "Stock Adjustment":
    "Correct inventory balances for damage, shrinkage, or reconciliation.",
  "Stock Transfer": "Move stock between warehouses or storage locations.",
  "Purchase Invoice":
    "Post vendor invoices, including the separate AI-assisted entry flow.",
  "Sales Invoice":
    "Create outbound invoices with taxes, pricing, and item lines.",
  "Bill Wise Receipt":
    "Allocate customer receipts against outstanding sales invoices.",
  "Bill Wise Payment":
    "Allocate supplier payments against outstanding purchase invoices.",
  "Sales Credit Notes":
    "Reduce billed sales values when goods are returned or charges are reversed.",
  "Sales Debit Notes":
    "Increase billed sales values when additional charges must be posted.",
  "Purchase Credit Notes":
    "Capture vendor-side reductions for returns, discounts, or corrections.",
  "Purchase Debit Notes":
    "Capture vendor-side increases when extra charges are claimed.",
};

const getDescription = (name: string) =>
  operationDescriptions[name] ??
  `Open ${name.toLowerCase()} from the operations workspace.`;

const isLeafActive = (pathname: string, path?: string) =>
  Boolean(path) && (pathname === path || pathname.startsWith(`${path}/`));

const flattenLeafItems = (items: AppNavLeaf[] = []): OperationCard[] =>
  items.flatMap<OperationCard>((item) => {
    if (item.path) {
      return [
        {
          title: item.name,
          path: item.path,
          description: getDescription(item.name),
          parentLabel: undefined,
        },
      ];
    }

    return (item.items ?? [])
      .filter((child): child is AppNavLeaf & { path: string } =>
        Boolean(child.path),
      )
      .map((child) => ({
        title: child.name,
        path: child.path,
        description: getDescription(child.name),
        parentLabel: item.name,
      }));
  });

export default function OperationsPage() {
  const location = useLocation();
  const operationsGroups = useMemo<OperationsGroup[]>(() => {
    const operationsItem = appNavItems.find(
      (item) => item.name === "Operations",
    );
    return operationsItem?.groups ?? [];
  }, []);

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Operations" />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="space-y-10">
          {operationsGroups.map((group) => {
            const entries = flattenLeafItems(group.items);

            return (
              <section key={group.name} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {group.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getDescription(group.name)}
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {entries.map((entry) => {
                    const active = isLeafActive(location.pathname, entry.path);

                    return (
                      <div
                        key={entry.path}
                        className={`flex h-full flex-col items-start justify-between rounded-lg border p-6 shadow-sm transition ${
                          active
                            ? "border-brand-200 bg-brand-50/70 dark:border-brand-800 dark:bg-brand-500/10"
                            : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                        }`}
                      >
                        <div>
                          {entry.parentLabel ? (
                            <span className="mb-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                              {entry.parentLabel}
                            </span>
                          ) : null}
                          <h3 className="mb-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                            {entry.title}
                          </h3>
                          <p className="mb-4 text-sm font-normal text-gray-700 dark:text-gray-400">
                            {entry.description}
                          </p>
                        </div>

                        <Link
                          to={entry.path}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
                        >
                          Open
                          <svg
                            className="h-3.5 w-3.5 rtl:rotate-180"
                            aria-hidden="true"
                            viewBox="0 0 14 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 5h12m0 0L9 1m4 4L9 9"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
