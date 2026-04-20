import { FormEvent, useMemo, useState } from "react";
import {
  Customer,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from "../../../../app/api/customerApi";
import StickyActionBar from "./customer-form/StickyActionBar";
import {
  CustomerFormProvider,
  useCustomerForm,
} from "./customer-form/CustomerFormContext";
import { toCustomerPayload } from "./customer-form/types";
import BasicDetailsSection from "./customer-form/sections/BasicDetailsSection";
import BillingAddressSection from "./customer-form/sections/BillingAddressSection";
import ContactSection from "./customer-form/sections/ContactSection";
import FinancialsSection from "./customer-form/sections/FinancialsSection";
import OpeningBalanceSection from "./customer-form/sections/OpeningBalanceSection";
import SalesAndPricingSection from "./customer-form/sections/SalesAndPricingSection";
import ShippingAddressesSection from "./customer-form/sections/ShippingAddressesSection";
import TaxDocumentsSection from "./customer-form/sections/TaxDocumentsSection";

interface CustomerFormProps {
  customer?: Customer | null;
  onClose: () => void;
}

function CustomerFormBody({ customer, onClose }: CustomerFormProps) {
  const { state } = useCustomerForm();
  const [formError, setFormError] = useState("");
  const [createCustomer, { isLoading: isCreating }] =
    useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] =
    useUpdateCustomerMutation();
  const isLoading = isCreating || isUpdating;
  const isEdit = Boolean(customer);

  const currentLedgerId = useMemo(() => customer?.ledgerId ?? "", [customer]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!state.basicDetails.code.trim() || !state.basicDetails.name.trim()) {
      setFormError("Code and name are required.");
      return;
    }

    if (
      (state.openingBalance.amount.trim() || state.openingBalance.asOfDate) &&
      (!state.openingBalance.amount.trim() || !state.openingBalance.asOfDate)
    ) {
      setFormError("Opening balance amount and date must both be filled.");
      return;
    }

    const partialTaxDocument = state.taxDocuments.find((item) => {
      const touched =
        item.number.trim() ||
        item.effectiveFrom ||
        item.effectiveTo ||
        item.state.trim() ||
        item.verifiedAt;
      return touched && (!item.number.trim() || !item.effectiveFrom);
    });

    if (partialTaxDocument) {
      setFormError(
        "Each tax document needs at least number and effective-from date.",
      );
      return;
    }

    try {
      const payload = toCustomerPayload(state);
      if (customer) {
        await updateCustomer({ id: customer.id, ...payload }).unwrap();
      } else {
        await createCustomer(payload).unwrap();
      }

      onClose();
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to save customer.";

      setFormError(message ?? "Failed to save customer.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
    >
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="space-y-8">
          <BasicDetailsSection currentLedgerId={currentLedgerId} />
          <ContactSection />
          <FinancialsSection />
          <OpeningBalanceSection />
          <SalesAndPricingSection />
        </div>
        <div className="space-y-8">
          <BillingAddressSection />
          <ShippingAddressesSection />
          <TaxDocumentsSection />
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

export default function CustomerForm({ customer, onClose }: CustomerFormProps) {
  return (
    <CustomerFormProvider customer={customer}>
      <CustomerFormBody customer={customer} onClose={onClose} />
    </CustomerFormProvider>
  );
}
