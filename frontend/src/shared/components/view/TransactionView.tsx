import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import Button from "@/shared/components/ui/button/Button";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";

// ── Layout shell ──────────────────────────────────────────────────────────────

export function ViewPageShell({
  title,
  backPath,
  isLoading,
  isError,
  isEmpty,
  children,
  actions,
}: {
  title: string;
  backPath: string;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="w-full space-y-5">
      <PageBreadcrumb pageTitle={title} />

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={() => navigate(backPath)}>
          <ArrowLeft size={14} />
          Back
        </Button>
        <div className="flex gap-2">{actions}</div>
      </div>

      {isLoading ? (
        <StateCard message={`Loading ${title.toLowerCase()}…`} />
      ) : isError || isEmpty ? (
        <StateCard message={`Unable to load ${title.toLowerCase()}.`} isError />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

export function ViewSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] ${className}`}>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
        {title}
      </p>
      {children}
    </section>
  );
}

// ── Info grid ─────────────────────────────────────────────────────────────────

export function ViewGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))" }}>
      {children}
    </div>
  );
}

export function ViewField({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string | number | null | undefined;
  strong?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">{label}</p>
      <p className={`mt-1 text-sm ${strong ? "font-semibold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
        {value ?? "—"}
      </p>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "Draft" || status === "Pending"
      ? "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400"
      : status === "Submitted" || status === "Completed" || status === "Created"
        ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400"
        : status === "Cancelled"
          ? "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400"
          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

// ── Line-items table wrapper ───────────────────────────────────────────────────

export function ViewTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </table>
    </div>
  );
}

export const TH = "whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";
export const TH_R = "whitespace-nowrap px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";
export const TD = "whitespace-nowrap px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300";
export const TD_R = "whitespace-nowrap px-3 py-2.5 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300";

export function fmt(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── State card ────────────────────────────────────────────────────────────────

function StateCard({ message, isError = false }: { message: string; isError?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
      <p className={`text-sm ${isError ? "text-error-500" : "text-gray-500 dark:text-gray-400"}`}>
        {message}
      </p>
    </div>
  );
}
