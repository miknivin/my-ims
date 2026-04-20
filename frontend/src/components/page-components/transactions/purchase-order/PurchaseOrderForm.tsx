import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { useCreatePurchaseOrderMutation } from "../../../../app/api/purchaseOrderApi";
import {
  PURCHASE_ORDER_DRAFT_STORAGE_KEY,
  toPurchaseOrderPayload,
} from "./types/types";
import {
  PurchaseOrderFormProvider,
  usePurchaseOrderForm,
} from "./PurchaseOrderFormContext";
import OrderDetailsSection from "./sections/OrderDetailsSection";
import VendorInformationSection from "./sections/VendorInformationSection";
import FinancialDetailsSection from "./sections/FinancialDetailsSection";
import DeliveryInformationSection from "./sections/DeliveryInformationSection";
import ProcurementSection from "./sections/ProcurementSection";
import LineItemsSection from "./LineItemsSection";
import SummaryFooterSection from "./SummaryFooterSection";
import TransactionStickyActionBar from "../shared/TransactionStickyActionBar";
import TransactionHeaderGrid from "../shared/TransactionHeaderGrid";

function getMutationErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
) {
  if (!error) {
    return "Unable to save the purchase order.";
  }

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
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!state.orderDetails.no.trim()) {
      setFormError("Purchase order number is required.");
      return;
    }

    if (!state.vendorInformation.vendorId) {
      setFormError("Please select a vendor.");
      return;
    }

    if (!state.deliveryInformation.address.trim()) {
      setFormError("Delivery address is required.");
      return;
    }

    const hasValidLine = state.items.some(
      (line) => line.itemId && Number.parseFloat(line.quantity) > 0,
    );

    if (!hasValidLine) {
      setFormError("Add at least one line item with a product and quantity.");
      return;
    }

    setIsSaving(true);

    try {
      await createPurchaseOrder(toPurchaseOrderPayload(state)).unwrap();

      window.localStorage.removeItem(PURCHASE_ORDER_DRAFT_STORAGE_KEY);
      reset();
      navigate("/operations/purchase-order");
    } catch (error) {
      setFormError(
        getMutationErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TransactionHeaderGrid>
        <OrderDetailsSection />
        <VendorInformationSection />
        <DeliveryInformationSection />
        <FinancialDetailsSection />
        <ProcurementSection />
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
        primaryLabel="Save Purchase Order"
        onReset={() => {
          reset();
          window.localStorage.removeItem(PURCHASE_ORDER_DRAFT_STORAGE_KEY);
          setFormError("");
        }}
        onCancel={() => navigate("/operations/purchase-order")}
      />
    </form>
  );
}

export default function PurchaseOrderForm() {
  return (
    <PurchaseOrderFormProvider>
      <PurchaseOrderFormBody />
    </PurchaseOrderFormProvider>
  );
}
