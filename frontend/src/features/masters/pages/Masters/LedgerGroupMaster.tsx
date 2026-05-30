import { useState } from "react";
import { LedgerGroup } from "@/redux/api/ledgerGroupApi";
import ComponentCard from "@/shared/components/common/ComponentCard";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import LedgerGroupForm from "@/features/masters/components/masters/ledger-group/LedgerGroupForm";
import LedgerGroupHeader from "@/features/masters/components/masters/ledger-group/LedgerGroupHeader";
import LedgerGroupTable from "@/features/masters/components/tables/LedgerGroupTable";
import { Modal } from "@/shared/components/ui/modal";

export default function LedgerGroupMaster() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLedgerGroup, setSelectedLedgerGroup] = useState<LedgerGroup | null>(null);

  const handleAdd = () => {
    setSelectedLedgerGroup(null);
    setIsOpen(true);
  };

  const handleEdit = (ledgerGroup: LedgerGroup) => {
    setSelectedLedgerGroup(ledgerGroup);
    setIsOpen(true);
  };

  const handleClose = () => {
    setSelectedLedgerGroup(null);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Ledger Group Master" />
      <LedgerGroupHeader onAdd={handleAdd} />
      <div className="space-y-6">
        <ComponentCard title="Ledger Group Catalogue">
          <LedgerGroupTable onEdit={handleEdit} />
        </ComponentCard>
      </div>

      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[800px] p-6 lg:p-10">
        <LedgerGroupForm ledgerGroup={selectedLedgerGroup} onClose={handleClose} />
      </Modal>
    </div>
  );
}
