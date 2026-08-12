import { FormEvent, useState } from "react";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router";
import { useCreateSalesOrderMutation } from "@/redux/api/salesOrderApi";
import ConfirmAlert from "@/shared/components/ui/alert/ConfirmAlert";
import TransactionHeaderGrid from "@/features/operations/shared/TransactionHeaderGrid";
import TransactionStickyActionBar from "@/features/operations/shared/TransactionStickyActionBar";
import LineItemsSection from "./LineItemsSection";
import { SalesOrderFormProvider, useSalesOrderForm } from "./SalesOrderFormContext";
import SummaryFooterSection from "./SummaryFooterSection";
import { toSalesOrderPayload } from "./types/types";
import CommercialDetailsSection from "./sections/CommercialDetailsSection";
import OrderDetailsSection from "./sections/OrderDetailsSection";
import PartyInformationSection from "./sections/PartyInformationSection";
import SalesDetailsSection from "./sections/SalesDetailsSection";

function getMutationErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
) {
  if (!error) return "Unable to save the sales order.";
  if ("status" in error) {
    const errorData = error.data as { message?: string } | undefined;
    return errorData?.message ?? "Unable to save the sales order.";
  }
  return error.message ?? "Unable to save the sales order.";
}

function SalesOrderFormBody() {
  const navigate = useNavigate();
  const { state, reset } = useSalesOrderForm();
  const [createSalesOrder] = useCreateSalesOrderMutation();
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSubmitAlert, setShowSubmitAlert] = useState(false);

  const validate = () => {
    setFormError("");
    if (!state.orderDetails.no.trim()) {
      setFormError("Sales order number is required.");
      return false;
    }
    if (!state.partyInformation.customerId) {
      setFormError("Please select a customer.");
      return false;
    }
    const hasValidLine = state.items.some(
      (line) => line.productId && Number.parseFloat(line.quantity) > 0,
    );
    if (!hasValidLine) {
      setFormError("Add at least one line item with a product and quantity.");
      return false;
    }
    return true;
  };

  const saveOrder = async (status: "Draft" | "Confirmed") => {
    setIsSaving(true);
    try {
      await createSalesOrder(toSalesOrderPayload(state, status)).unwrap();
      reset();
      navigate("/operations/sales-order");
    } catch (error) {
      setFormError(
        getMutationErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validate()) setShowSubmitAlert(true);
  };

  const handleDraft = () => {
    if (validate()) void saveOrder("Draft");
  };

  return (
    <>
      <ConfirmAlert
        open={showSubmitAlert}
        title="Confirm sales order?"
        message="This will save the sales order as Confirmed."
        confirmLabel="Confirm"
        isConfirming={isSaving}
        onConfirm={() => {
          setShowSubmitAlert(false);
          void saveOrder("Confirmed");
        }}
        onCancel={() => setShowSubmitAlert(false)}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <TransactionHeaderGrid>
          <OrderDetailsSection />
          <PartyInformationSection />
          <CommercialDetailsSection />
          <SalesDetailsSection />
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
          primaryLabel="Confirm Order"
          draftLabel="Save as Draft"
          onDraft={handleDraft}
          onReset={() => {
            reset();
            setFormError("");
          }}
          onCancel={() => navigate("/operations/sales-order")}
        />
      </form>
    </>
  );
}

export default function SalesOrderForm() {
  return (
    <SalesOrderFormProvider>
      <SalesOrderFormBody />
    </SalesOrderFormProvider>
  );
}
