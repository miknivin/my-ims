import { useState } from "react";
import { Tax } from "../../app/api/taxApi";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import TaxForm from "../../components/page-components/masters/tax/TaxForm";
import TaxHeader from "../../components/page-components/masters/tax/TaxHeader";
import TaxTable from "../../components/tables/TaxTable";
import { Modal } from "../../components/ui/modal";

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
