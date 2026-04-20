import { useNavigate, useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ProductForm from "../../components/page-components/masters/product/ProductForm";
import { useGetProductByIdQuery } from "../../app/api/productApi";

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEdit = Boolean(productId);
  const { data: product, isLoading, isError } = useGetProductByIdQuery(productId ?? "", { skip: !productId });

  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle={isEdit ? "Edit Product" : "Add Product"} />
      <ComponentCard title={isEdit ? "Edit Product" : "Add Product"} desc="Product entry is handled as a full page so grouped master sections have enough room.">
        {isLoading ? (
          <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Loading product details...</div>
        ) : isError ? (
          <div className="py-10 text-center text-sm text-red-600 dark:text-red-400">Unable to load product details.</div>
        ) : (
          <ProductForm product={product} onClose={() => navigate("/masters/product")} />
        )}
      </ComponentCard>
    </div>
  );
}
