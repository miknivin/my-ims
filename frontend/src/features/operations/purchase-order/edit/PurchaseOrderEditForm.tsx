import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import {
  useDownloadPurchaseOrderPdfMutation,
  useUpdatePurchaseOrderMutation,
  useUpdatePurchaseOrderStatusMutation,
} from "@/redux/api/purchaseOrderApi";
import { toPurchaseOrderPayload, PurchaseOrderFormState } from "../create/types/types";
import {
  PurchaseOrderEditConfig,
  PurchaseOrderEditFormProvider,
  usePurchaseOrderEditForm,
} from "./PurchaseOrderEditFormContext";
import OrderDetailsSection from "./sections/OrderDetailsSection";
import VendorInformationSection from "./sections/VendorInformationSection";
import FinancialDetailsSection from "./sections/FinancialDetailsSection";
import DeliveryInformationSection from "./sections/DeliveryInformationSection";
import LineItemsSection from "./LineItemsSection";
import SummaryFooterSection from "./SummaryFooterSection";
import TransactionStickyActionBar from "@/features/operations/shared/TransactionStickyActionBar";
import TransactionHeaderGrid from "@/features/operations/shared/TransactionHeaderGrid";

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

function PurchaseOrderEditFormBody() {
  const navigate = useNavigate();
  const { state, editConfig } = usePurchaseOrderEditForm();
  const [updatePurchaseOrder] = useUpdatePurchaseOrderMutation();
  const [updatePurchaseOrderStatus] = useUpdatePurchaseOrderStatusMutation();
  const [downloadPdf] = useDownloadPurchaseOrderPdfMutation();
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const isSubmitted = editConfig.status === "Submitted";

  const validate = () => {
    if (!state.vendorInformation.vendorId) {
      setFormError("Vendor is required.");
      return false;
    }
    if (!state.deliveryInformation.address.trim()) {
      setFormError("Delivery address is required.");
      return false;
    }
    if (!isSubmitted) {
      const hasValidLine = state.items.some(
        (line) => line.itemId && Number.parseFloat(line.quantity) > 0,
      );
      if (!hasValidLine) {
        setFormError("Add at least one line item with a product and quantity.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    setIsSaving(true);
    try {
      await updatePurchaseOrder({
        id: editConfig.id,
        ...toPurchaseOrderPayload(state),
      }).unwrap();

      if (!isSubmitted) {
        await updatePurchaseOrderStatus({
          id: editConfig.id,
          status: "Submitted",
        }).unwrap();
      }

      navigate("/operations/purchase-order");
    } catch (error) {
      setFormError(
        getMutationErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    setFormError("");
    if (!validate()) return;

    setIsSaving(true);
    try {
      await updatePurchaseOrder({
        id: editConfig.id,
        ...toPurchaseOrderPayload(state),
      }).unwrap();
      navigate("/operations/purchase-order");
    } catch (error) {
      setFormError(
        getMutationErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const url = await downloadPdf(editConfig.id).unwrap();
      const a = document.createElement("a");
      a.href = url;
      a.download = `PO-${state.orderDetails.no}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const primaryLabel = isSubmitted ? "Save Changes" : "Save & Submit";
  const draftLabel = isSubmitted ? undefined : "Save Changes";

  return (
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
        primaryLabel={primaryLabel}
        draftLabel={draftLabel}
        onDraft={draftLabel ? handleSaveChanges : undefined}
        onReset={() => setFormError("")}
        onCancel={() => navigate("/operations/purchase-order")}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
    </form>
  );
}

export default function PurchaseOrderEditForm({
  initialState,
  editConfig,
}: {
  initialState: PurchaseOrderFormState;
  editConfig: PurchaseOrderEditConfig;
}) {
  return (
    <PurchaseOrderEditFormProvider initialState={initialState} editConfig={editConfig}>
      <PurchaseOrderEditFormBody />
    </PurchaseOrderEditFormProvider>
  );
}
