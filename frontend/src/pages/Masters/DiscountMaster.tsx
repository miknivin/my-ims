import { useState } from "react";
import { Discount } from "../../app/api/discountApi";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DiscountForm from "../../components/page-components/masters/discount/DiscountForm";
import DiscountHeader from "../../components/page-components/masters/discount/DiscountHeader";
import DiscountTable from "../../components/tables/DiscountTable";
import { Modal } from "../../components/ui/modal";

export default function DiscountMaster() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);

  const handleAdd = () => {
    setSelectedDiscount(null);
    setIsOpen(true);
  };

  const handleEdit = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsOpen(true);
  };

  const handleClose = () => {
    setSelectedDiscount(null);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Discount Master" />
      <DiscountHeader onAdd={handleAdd} />
      <div className="space-y-6">
        <ComponentCard title="Discount Catalogue">
          <DiscountTable onEdit={handleEdit} />
        </ComponentCard>
      </div>

      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[820px] p-6 lg:p-10">
        <DiscountForm discount={selectedDiscount} onClose={handleClose} />
      </Modal>
    </div>
  );
}
