import { Link } from "react-router";

interface ReportCategoryCardProps {
  title: string;
  description: string;
  path: string;
  label?: string;
}

export default function ReportCategoryCard({
  title,
  description,
  path,
  label = "View Report",
}: ReportCategoryCardProps) {
  return (
    <div className="flex flex-col items-start justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div>
        <h5 className="mb-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h5>
        <p className="mb-4 text-sm font-normal text-gray-700 dark:text-gray-400">
          {description}
        </p>
      </div>
      <Link
        to={path}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
      >
        {label}
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
}
