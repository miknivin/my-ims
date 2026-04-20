import { useState } from "react";
import { LedgerGroup } from "../../app/api/ledgerGroupApi";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import LedgerGroupForm from "../../components/page-components/masters/ledger-group/LedgerGroupForm";
import LedgerGroupHeader from "../../components/page-components/masters/ledger-group/LedgerGroupHeader";
import LedgerGroupTable from "../../components/tables/LedgerGroupTable";
import { Modal } from "../../components/ui/modal";

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
