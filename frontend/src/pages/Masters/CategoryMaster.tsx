import { useState } from "react";
import { Category } from "../../app/api/categoryApi";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import CategoryForm from "../../components/page-components/masters/category/CategoryForm";
import CategoryHeader from "../../components/page-components/masters/category/CategoryHeader";
import CategoryTable from "../../components/tables/CategoryTable";
import { Modal } from "../../components/ui/modal";

export default function CategoryMaster() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsOpen(true);
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Category Master" />
      <CategoryHeader onAdd={handleAdd} />
      <div className="space-y-6">
        <ComponentCard title="Category Catalogue">
          <CategoryTable onEdit={handleEdit} />
        </ComponentCard>
      </div>

      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[800px] p-6 lg:p-10">
        <CategoryForm category={selectedCategory} onClose={handleClose} />
      </Modal>
    </div>
  );
}
