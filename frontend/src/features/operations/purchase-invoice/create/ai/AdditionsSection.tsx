import SharedAdditionsSection from "@/features/operations/shared/AdditionsSection";
import { usePurchaseInvoiceForm } from "./PurchaseInvoiceFormContext";

export default function AdditionsSection() {
  const { state, addAddition, updateAddition, removeAddition } =
    usePurchaseInvoiceForm();

  return (
    <SharedAdditionsSection
      additions={state.additions}
      onAdd={addAddition}
      onUpdate={updateAddition}
      onRemove={removeAddition}
      description="Capture freight, ledger-linked charges, and invoice deductions here."
    />
  );
}
