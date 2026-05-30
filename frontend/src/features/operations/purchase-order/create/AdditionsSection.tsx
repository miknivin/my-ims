import SharedAdditionsSection from "@/features/operations/shared/AdditionsSection";
import { usePurchaseOrderForm } from "./PurchaseOrderFormContext";

export default function AdditionsSection() {
  const { state, addAddition, updateAddition, removeAddition, setFooter } =
    usePurchaseOrderForm();

  return (
    <SharedAdditionsSection
      additions={state.additions}
      onAdd={addAddition}
      onUpdate={updateAddition}
      onRemove={removeAddition}
      description="Charges, deductions, and ledger-linked adjustments for the purchase order."
      footerLayoutClassName="grid gap-4 md:grid-cols-1"
      footerFields={[
        {
          label: "Advance",
          value: state.footer.advance,
          min: "0",
          onChange: (advance) => setFooter({ advance }),
        },
      ]}
    />
  );
}
