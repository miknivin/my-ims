import { useState } from "react";
import { Discount } from "@/redux/api/discountApi";
import ComponentCard from "@/shared/components/common/ComponentCard";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import DiscountForm from "@/features/masters/components/masters/discount/DiscountForm";
import DiscountHeader from "@/features/masters/components/masters/discount/DiscountHeader";
import DiscountTable from "@/features/masters/components/tables/DiscountTable";
import { Modal } from "@/shared/components/ui/modal";

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
