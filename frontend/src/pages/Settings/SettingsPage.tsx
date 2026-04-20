import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import SettingsForm from "../../components/page-components/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="Settings" />
      <SettingsForm />
    </div>
  );
}
