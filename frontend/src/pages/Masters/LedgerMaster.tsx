import { useState } from "react";
import { Ledger } from "../../app/api/ledgerApi";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import LedgerForm from "../../components/page-components/masters/ledger/LedgerForm";
import LedgerHeader from "../../components/page-components/masters/ledger/LedgerHeader";
import LedgerTable from "../../components/tables/LedgerTable";
import { Modal } from "../../components/ui/modal";

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
