import { FC, ReactNode, useState } from "react";
import { Info } from "lucide-react";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";

type ReportLayoutRootProps = {
  children: ReactNode;
  className?: string;
};

type ReportLayoutBreadcrumbProps = {
  title: string;
};

type ReportLayoutHeaderProps = {
  children: ReactNode;
  className?: string;
};

type ReportLayoutActionsProps = {
  children: ReactNode;
  className?: string;
};

type ReportLayoutPanelProps = {
  children: ReactNode;
  className?: string;
};

type ReportLayoutSummaryProps = {
  children: ReactNode;
  className?: string;
};

type ReportMetricProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  tooltip?: string;
  className?: string;
};

type ReportLayoutTableProps = {
  children: ReactNode;
  className?: string;
};

type ReportLayoutEmptyStateProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

type ReportLayoutComponent = FC<ReportLayoutRootProps> & {
  Breadcrumb: FC<ReportLayoutBreadcrumbProps>;
  Header: FC<ReportLayoutHeaderProps>;
  Actions: FC<ReportLayoutActionsProps>;
  Filters: FC<ReportLayoutPanelProps>;
  Summary: FC<ReportLayoutSummaryProps>;
  Metric: FC<ReportMetricProps>;
  Content: FC<ReportLayoutPanelProps>;
  Table: FC<ReportLayoutTableProps>;
  Footer: FC<ReportLayoutPanelProps>;
  EmptyState: FC<ReportLayoutEmptyStateProps>;
};

const ReportLayout = (({ children, className = "" }: ReportLayoutRootProps) => (
  <div className={`space-y-4 ${className}`}>{children}</div>
)) as ReportLayoutComponent;

ReportLayout.Breadcrumb = function ReportLayoutBreadcrumb({
  title,
}: ReportLayoutBreadcrumbProps) {
  return <PageBreadcrumb pageTitle={title} />;
};

ReportLayout.Header = function ReportLayoutHeader({
  children,
  className = "",
}: ReportLayoutHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-white/[0.03] sm:flex-row sm:items-start sm:justify-between ${className}`}
    >
      {children}
    </div>
  );
};

ReportLayout.Actions = function ReportLayoutActions({
  children,
  className = "",
}: ReportLayoutActionsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {children}
    </div>
  );
};

ReportLayout.Filters = function ReportLayoutFilters({
  children,
  className = "",
}: ReportLayoutPanelProps) {
  return (
    <section
      className={`rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {children}
    </section>
  );
};

ReportLayout.Summary = function ReportLayoutSummary({
  children,
  className = "",
}: ReportLayoutSummaryProps) {
  return (
    <section
      className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-4 ${className}`}
    >
      {children}
    </section>
  );
};

ReportLayout.Metric = function ReportLayoutMetric({
  label,
  value,
  hint,
  tooltip,
  className = "",
}: ReportMetricProps) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {value}
        </span>
        {tooltip && (
          <div className="relative inline-flex">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
              className="flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <Info size={14} />
            </button>
            {open && (
              <div className="absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-lg bg-gray-800 px-3 py-2 text-center text-xs text-white shadow-lg dark:bg-gray-700">
                {tooltip}
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-700" />
              </div>
            )}
          </div>
        )}
      </div>
      {hint ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
};

ReportLayout.Content = function ReportLayoutContent({
  children,
  className = "",
}: ReportLayoutPanelProps) {
  return (
    <section
      className={`rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {children}
    </section>
  );
};

ReportLayout.Table = function ReportLayoutTable({
  children,
  className = "",
}: ReportLayoutTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="min-w-full">{children}</div>
    </div>
  );
};

ReportLayout.Footer = function ReportLayoutFooter({
  children,
  className = "",
}: ReportLayoutPanelProps) {
  return (
    <div
      className={`flex flex-col gap-3 border-t border-gray-100 px-4 py-3 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      {children}
    </div>
  );
};

ReportLayout.EmptyState = function ReportLayoutEmptyState({
  title,
  description,
  children,
}: ReportLayoutEmptyStateProps) {
  return (
    <div className="px-6 py-12 text-center">
      <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h4>
      {description ? (
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
};

export default ReportLayout;
