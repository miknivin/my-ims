import { useState } from "react";
import { Warehouse } from "../../app/api/warehouseApi";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import WarehouseForm from "../../components/page-components/masters/warehouse/WarehouseForm";
import WarehouseHeader from "../../components/page-components/masters/warehouse/WarehouseHeader";
import WarehouseTable from "../../components/tables/WarehouseTable";
import { Modal } from "../../components/ui/modal";

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
