import { useState } from "react";
import { Ledger } from "@/redux/api/ledgerApi";
import ComponentCard from "@/shared/components/common/ComponentCard";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import LedgerForm from "@/features/masters/components/masters/ledger/LedgerForm";
import LedgerHeader from "@/features/masters/components/masters/ledger/LedgerHeader";
import LedgerTable from "@/features/masters/components/tables/LedgerTable";
import { Modal } from "@/shared/components/ui/modal";

export default function LedgerMaster() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState<Ledger | null>(null);

  const handleAdd = () => {
    setSelectedLedger(null);
    setIsOpen(true);
  };

  const handleEdit = (ledger: Ledger) => {
    setSelectedLedger(ledger);
    setIsOpen(true);
  };

  const handleClose = () => {
    setSelectedLedger(null);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Ledger Master" />
      <LedgerHeader onAdd={handleAdd} />
      <div className="space-y-6">
        <ComponentCard title="Ledger Catalogue">
          <LedgerTable onEdit={handleEdit} />
        </ComponentCard>
      </div>

      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[880px] p-6 lg:p-10">
        <LedgerForm ledger={selectedLedger} onClose={handleClose} />
      </Modal>
    </div>
  );
}
