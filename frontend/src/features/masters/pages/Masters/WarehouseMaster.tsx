import { useState } from "react";
import { Warehouse } from "@/redux/api/warehouseApi";
import ComponentCard from "@/shared/components/common/ComponentCard";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import WarehouseForm from "@/features/masters/components/masters/warehouse/WarehouseForm";
import WarehouseHeader from "@/features/masters/components/masters/warehouse/WarehouseHeader";
import WarehouseTable from "@/features/masters/components/tables/WarehouseTable";
import { Modal } from "@/shared/components/ui/modal";

export default function WarehouseMaster() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Warehouse Master" />
      <WarehouseHeader
        onAdd={() => {
          setSelectedWarehouse(null);
          setIsOpen(true);
        }}
      />
      <div className="space-y-6">
        <ComponentCard title="Warehouse Catalogue">
          <WarehouseTable
            onEdit={(warehouse) => {
              setSelectedWarehouse(warehouse);
              setIsOpen(true);
            }}
          />
        </ComponentCard>
      </div>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} className="max-w-[820px] p-6 lg:p-10">
        <WarehouseForm warehouse={selectedWarehouse} onClose={() => setIsOpen(false)} />
      </Modal>
    </div>
  );
}
