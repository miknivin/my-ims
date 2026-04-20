import { Link, useSearchParams } from "react-router";
import { masterCards } from "../../../layout/navigation";

export default function MastersGrid() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword")?.toLowerCase() ?? "";

  const filteredMasters = masterCards.filter(
    (master) =>
      master.title.toLowerCase().includes(keyword) ||
      master.desc.toLowerCase().includes(keyword)
  );

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredMasters.map((master) => (
        <div
          key={master.path}
          className="flex max-w-sm flex-col items-start justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div>
            <h5 className="mb-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {master.title}
            </h5>
            <p className="mb-3 text-sm font-normal text-gray-700 dark:text-gray-400">
              {master.desc}
            </p>
          </div>
          <Link
            to={master.path}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
          >
            {master.ready ? "Manage" : "Open"}
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
      ))}
      {filteredMasters.length === 0 ? (
        <p className="col-span-full py-8 text-center text-gray-500">
          No masters found matching "{keyword || "your search"}".
        </p>
      ) : null}
    </div>
  );
}
