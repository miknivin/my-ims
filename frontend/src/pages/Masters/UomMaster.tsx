import { useState } from "react";
import { Uom } from "../../app/api/uomApi";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import UomHeader from "../../components/page-components/masters/uom/UomHeader";
import UomForm from "../../components/page-components/masters/uom/UomForm";
import UomTable from "../../components/tables/UomTable";
import { Modal } from "../../components/ui/modal";

export default function UomMaster() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUom, setSelectedUom] = useState<Uom | null>(null);

  const handleAdd = () => {
    setSelectedUom(null);
    setIsOpen(true);
  };

  const handleEdit = (uom: Uom) => {
    setSelectedUom(uom);
    setIsOpen(true);
  };

  const handleClose = () => {
    setSelectedUom(null);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="UOM Master" />
      <UomHeader onAdd={handleAdd} />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <UomTable onEdit={handleEdit} />
        </ComponentCard>
      </div>

      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[700px] p-6 lg:p-10">
        <UomForm uom={selectedUom} onClose={handleClose} />
      </Modal>
    </div>
  );
}
