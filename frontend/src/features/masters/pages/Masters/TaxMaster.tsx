import { useState } from "react";
import { Tax } from "@/redux/api/taxApi";
import ComponentCard from "@/shared/components/common/ComponentCard";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import TaxForm from "@/features/masters/components/masters/tax/TaxForm";
import TaxHeader from "@/features/masters/components/masters/tax/TaxHeader";
import TaxTable from "@/features/masters/components/tables/TaxTable";
import { Modal } from "@/shared/components/ui/modal";

export default function TaxMaster() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);

  const handleAdd = () => {
    setSelectedTax(null);
    setIsOpen(true);
  };

  const handleEdit = (tax: Tax) => {
    setSelectedTax(tax);
    setIsOpen(true);
  };

  const handleClose = () => {
    setSelectedTax(null);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Tax Master" />
      <TaxHeader onAdd={handleAdd} />
      <div className="space-y-6">
        <ComponentCard title="Tax Catalogue">
          <TaxTable onEdit={handleEdit} />
        </ComponentCard>
      </div>

      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[900px] p-6 lg:p-10">
        <TaxForm tax={selectedTax} onClose={handleClose} />
      </Modal>
    </div>
  );
}
