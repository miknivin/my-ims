import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import MastersGrid from "../../components/page-components/masters/MastersGrid";

export default function Masters() {
  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Masters" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="w-full">
          <MastersGrid />
        </div>
      </div>
    </div>
  );
}
