import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import {
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderStatusMutation,
  usePreviewPurchaseOrderPdfMutation,
} from "@/redux/api/purchaseOrderApi";
import {
  PURCHASE_ORDER_DRAFT_STORAGE_KEY,
  toPurchaseOrderPayload,
} from "./types/types";
import {
  PurchaseOrderFormProvider,
  usePurchaseOrderForm,
} from "./PurchaseOrderFormContext";
import { validatePurchaseOrderForm } from "./validation/validatePurchaseOrderForm";
import OrderDetailsSection from "./sections/OrderDetailsSection";
import VendorInformationSection from "./sections/VendorInformationSection";
import FinancialDetailsSection from "./sections/FinancialDetailsSection";
import DeliveryInformationSection from "./sections/DeliveryInformationSection";
import LineItemsSection from "./LineItemsSection";
import SummaryFooterSection from "./SummaryFooterSection";
import TransactionStickyActionBar from "@/features/operations/shared/TransactionStickyActionBar";
import TransactionHeaderGrid from "@/features/operations/shared/TransactionHeaderGrid";
import PurchaseOrderPdfPreviewModal from "../PurchaseOrderPdfPreviewModal";

function getMutationErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
) {
  if (!error) return "Unable to save the purchase order.";
  if ("status" in error) {
    const errorData = error.data as { message?: string } | undefined;
    return errorData?.message ?? "Unable to save the purchase order.";
  }
  return error.message ?? "Unable to save the purchase order.";
}

function PurchaseOrderFormBody() {
  const navigate = useNavigate();
  const { state, reset } = usePurchaseOrderForm();
  const [createPurchaseOrder] = useCreatePurchaseOrderMutation();
  const [updatePurchaseOrderStatus] = useUpdatePurchaseOrderStatusMutation();
  const [previewPdf] = usePreviewPurchaseOrderPdfMutation();
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const validate = () => {
    const error = validatePurchaseOrderForm(state);
    if (error) {
      setFormError(error);
      return false;
    }
    return true;
  };

  const handlePreview = async () => {
    setFormError("");
    if (!validate()) return;

    setIsPreviewing(true);
    try {
      const url = await previewPdf(toPurchaseOrderPayload(state)).unwrap();
      setPreviewUrl(url);
    } catch {
      setFormError("Failed to generate PDF preview. Please try again.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const clearAndRedirect = () => {
    window.localStorage.removeItem(PURCHASE_ORDER_DRAFT_STORAGE_KEY);
    reset();
    navigate("/operations/purchase-order");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    setIsSaving(true);
    try {
      const created = await createPurchaseOrder(
        toPurchaseOrderPayload(state),
      ).unwrap();
      await updatePurchaseOrderStatus({
        id: created.id,
        status: "Submitted",
      }).unwrap();
      clearAndRedirect();
    } catch (error) {
      setFormError(
        getMutationErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setFormError("");
    if (!validate()) return;

    setIsSaving(true);
    try {
      await createPurchaseOrder(toPurchaseOrderPayload(state)).unwrap();
      clearAndRedirect();
    } catch (error) {
      setFormError(
        getMutationErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <>
    <PurchaseOrderPdfPreviewModal url={previewUrl} onClose={closePreview} />
    <form onSubmit={handleSubmit} className="space-y-6">
      <TransactionHeaderGrid columns={4}>
        <OrderDetailsSection />
        <VendorInformationSection />
        <DeliveryInformationSection />
        <FinancialDetailsSection />
      </TransactionHeaderGrid>

      <LineItemsSection />
      <SummaryFooterSection />

      {formError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {formError}
        </div>
      ) : null}

      <TransactionStickyActionBar
        isSaving={isSaving}
        primaryLabel="Submit"
        draftLabel="Save as Draft"
        onDraft={handleSaveAsDraft}
        onReset={() => {
          reset();
          window.localStorage.removeItem(PURCHASE_ORDER_DRAFT_STORAGE_KEY);
          setFormError("");
        }}
        onCancel={() => navigate("/operations/purchase-order")}
        onPreview={handlePreview}
        isPreviewing={isPreviewing}
      />
    </form>
    </>
  );
}

export default function PurchaseOrderForm() {
  return (
    <PurchaseOrderFormProvider>
      <PurchaseOrderFormBody />
    </PurchaseOrderFormProvider>
  );
}
