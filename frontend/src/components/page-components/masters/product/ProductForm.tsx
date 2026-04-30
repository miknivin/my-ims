import { FormEvent, useState } from "react";
import {
  Product,
  useCreateProductMutation,
  useUpdateProductMutation,
} from "../../../../app/api/productApi";
import StickyActionBar from "./product-form/StickyActionBar";
import {
  ProductFormProvider,
  useProductForm,
} from "./product-form/ProductFormContext";
import { toProductPayload } from "./product-form/types";
import AdditionalDetailsSection from "./product-form/sections/AdditionalDetailsSection";
import BasicInfoSection from "./product-form/sections/BasicInfoSection";
import OpeningStockSection from "./product-form/sections/OpeningStockSection";
import PricingSection from "./product-form/sections/PricingSection";
import PropertiesSection from "./product-form/sections/PropertiesSection";
import StockAndMeasurementSection from "./product-form/sections/StockAndMeasurementSection";

function ProductFormBody({
  product,
  onClose,
}: {
  product?: Product | null;
  onClose: () => void;
}) {
  const { state } = useProductForm();
  const [formError, setFormError] = useState("");
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const isLoading = isCreating || isUpdating;
  const isEdit = Boolean(product);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!state.basicInfo.code.trim() || !state.basicInfo.name.trim()) {
      setFormError("Code and name are required.");
      return;
    }

    if (
      !state.stockAndMeasurement.baseUomId ||
      !state.stockAndMeasurement.purchaseUomId ||
      !state.stockAndMeasurement.salesUomId ||
      !state.stockAndMeasurement.stockUomId
    ) {
      setFormError("Base, purchase, sales, and stock UOM are required.");
      return;
    }

    if (
      (state.openingStock.quantity.trim() || state.openingStock.asOfDate) &&
      (!state.openingStock.quantity.trim() || !state.openingStock.asOfDate)
    ) {
      setFormError("Opening stock quantity and date must both be filled.");
      return;
    }

    try {
      const payload = toProductPayload(state);
      if (product) {
        await updateProduct({ id: product.id, ...payload }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }
      onClose();
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to save product.";
      setFormError(message ?? "Failed to save product.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl bg-white p-3 shadow-sm dark:bg-gray-900"
    >
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="space-y-8">
          <BasicInfoSection />
          <PricingSection />
          <OpeningStockSection />
        </div>
        <div className="space-y-8">
          <StockAndMeasurementSection />
          <PropertiesSection />
          <AdditionalDetailsSection />
        </div>
      </div>
      {formError ? <p className="text-sm text-error-500">{formError}</p> : null}
      <StickyActionBar
        isLoading={isLoading}
        isEdit={isEdit}
        onCancel={onClose}
      />
    </form>
  );
}

export default function ProductForm({
  product,
  onClose,
}: {
  product?: Product | null;
  onClose: () => void;
}) {
  return (
    <ProductFormProvider product={product}>
      <ProductFormBody product={product} onClose={onClose} />
    </ProductFormProvider>
  );
}
