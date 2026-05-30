import { useState } from "react";
import { Currency } from "@/redux/api/currencyApi";
import ComponentCard from "@/shared/components/common/ComponentCard";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import CurrencyForm from "@/features/masters/components/masters/currency/CurrencyForm";
import CurrencyHeader from "@/features/masters/components/masters/currency/CurrencyHeader";
import CurrencyTable from "@/features/masters/components/tables/CurrencyTable";
import { Modal } from "@/shared/components/ui/modal";

export default function CurrencyMaster() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

  const handleAdd = () => {
    setSelectedCurrency(null);
    setIsOpen(true);
  };

  const handleEdit = (currency: Currency) => {
    setSelectedCurrency(currency);
    setIsOpen(true);
  };

  const handleClose = () => {
    setSelectedCurrency(null);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Currency Master" />
      <CurrencyHeader onAdd={handleAdd} />
      <div className="space-y-6">
        <ComponentCard title="Currency Catalogue">
          <CurrencyTable onEdit={handleEdit} />
        </ComponentCard>
      </div>

      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[800px] p-6 lg:p-10">
        <CurrencyForm currency={selectedCurrency} onClose={handleClose} />
      </Modal>
    </div>
  );
}
