import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import {
  useUpdateGoodsReceiptNoteMutation,
  useDownloadGoodsReceiptNotePdfMutation,
} from "@/redux/api/goodsReceiptNoteApi";
import { GoodsReceiptFormState, toGoodsReceiptPayload } from "./create/types/types";
import { GoodsReceiptFormProvider, useGoodsReceiptForm } from "./create/GoodsReceiptFormContext";
import TransactionHeaderGrid from "@/features/operations/shared/TransactionHeaderGrid";
import TransactionStickyActionBar from "@/features/operations/shared/TransactionStickyActionBar";
import LineItemsSection from "./create/LineItemsSection";
import SummaryFooterSection from "./create/SummaryFooterSection";
import OrderDetailsSection from "./create/sections/OrderDetailsSection";
import VendorInformationSection from "./create/sections/VendorInformationSection";
import LogisticsSection from "./create/sections/LogisticsSection";

function getMutationErrorMessage(error: FetchBaseQueryError | SerializedError | undefined) {
  if (!error) return "Unable to save the goods receipt note.";
  if ("status" in error) {
    const errorData = error.data as { message?: string } | undefined;
    return errorData?.message ?? "Unable to save the goods receipt note.";
  }
  return error.message ?? "Unable to save the goods receipt note.";
}

function GoodsReceiptNoteEditFormBody({ id }: { id: string }) {
  const navigate = useNavigate();
  const { state } = useGoodsReceiptForm();
  const [updateGoodsReceiptNote] = useUpdateGoodsReceiptNoteMutation();
  const [downloadPdf] = useDownloadGoodsReceiptNotePdfMutation();
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const validate = () => {
    setFormError("");
    if (!state.vendorInformation.vendorId) {
      setFormError("Please select a vendor.");
      return false;
    }
    if (state.sourceRef.mode === "AgainstPurchaseOrder" && !state.sourceRef.purchaseOrderId) {
      setFormError("Please choose a purchase order reference.");
      return false;
    }
    const hasValidLine = state.items.some(
      (line) => line.productId && line.unitId && line.warehouseId && Number.parseFloat(line.quantity) > 0,
    );
    if (!hasValidLine) {
      setFormError("Add at least one line item with a product, unit, warehouse, and quantity.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      await updateGoodsReceiptNote({ id, ...toGoodsReceiptPayload(state) }).unwrap();
      navigate("/operations/goods-receipt-note");
    } catch (error) {
      setFormError(getMutationErrorMessage(error as FetchBaseQueryError | SerializedError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const url = await downloadPdf(id).unwrap();
      const a = document.createElement("a");
      a.href = url;
      a.download = `GRN-${state.document.no}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TransactionHeaderGrid>
        <OrderDetailsSection />
        <VendorInformationSection />
        <LogisticsSection />
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
        primaryLabel="Save Changes"
        onReset={() => setFormError("")}
        onCancel={() => navigate("/operations/goods-receipt-note")}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
    </form>
  );
}

export default function GoodsReceiptNoteEditForm({
  initialState,
  id,
}: {
  initialState: GoodsReceiptFormState;
  id: string;
}) {
  return (
    <GoodsReceiptFormProvider initialState={initialState}>
      <GoodsReceiptNoteEditFormBody id={id} />
    </GoodsReceiptFormProvider>
  );
}
