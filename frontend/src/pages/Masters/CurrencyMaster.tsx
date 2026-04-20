import { useState } from "react";
import { Currency } from "../../app/api/currencyApi";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import CurrencyForm from "../../components/page-components/masters/currency/CurrencyForm";
import CurrencyHeader from "../../components/page-components/masters/currency/CurrencyHeader";
import CurrencyTable from "../../components/tables/CurrencyTable";
import { Modal } from "../../components/ui/modal";

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
