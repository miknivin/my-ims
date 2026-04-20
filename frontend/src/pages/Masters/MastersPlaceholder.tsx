import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

interface MastersPlaceholderProps {
  title: string;
  description: string;
}

export default function MastersPlaceholder({
  title,
  description,
}: MastersPlaceholderProps) {
  return (
    <div>
      <PageBreadcrumb pageTitle={title} />
      <ComponentCard title={title} desc={description}>
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/40">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            UI shell is ready
          </h4>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            This section is intentionally added as placeholder content for the next integration pass.
          </p>
        </div>
      </ComponentCard>
    </div>
  );
}
