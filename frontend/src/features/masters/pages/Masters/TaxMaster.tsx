import { useNavigate } from "react-router";
import { Tax } from "@/redux/api/taxApi";
import ComponentCard from "@/shared/components/common/ComponentCard";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import TaxHeader from "@/features/masters/components/masters/tax/TaxHeader";
import TaxTable from "@/features/masters/components/tables/TaxTable";

export default function TaxMaster() {
  const navigate = useNavigate();

  const handleAdd = () => navigate("/masters/tax/new");
  const handleEdit = (tax: Tax) => navigate(`/masters/tax/${tax.id}/edit`);

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Tax Master" />
      <TaxHeader onAdd={handleAdd} />
      <div className="space-y-6">
        <ComponentCard title="Tax Catalogue">
          <TaxTable onEdit={handleEdit} />
        </ComponentCard>
      </div>
    </div>
  );
}
