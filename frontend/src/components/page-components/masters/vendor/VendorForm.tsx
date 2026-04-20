import { FormEvent, useMemo, useState } from "react";
import {
  Vendor,
  useCreateVendorMutation,
  useUpdateVendorMutation,
} from "../../../../app/api/vendorApi";
import StickyActionBar from "./vendor-form/StickyActionBar";
import {
  VendorFormProvider,
  useVendorForm,
} from "./vendor-form/VendorFormContext";
import { createVendorFormState, toVendorPayload } from "./vendor-form/types";
import AddressAndContactSection from "./vendor-form/sections/AddressAndContactSection";
import BankDetailsSection from "./vendor-form/sections/BankDetailsSection";
import BasicInfoSection from "./vendor-form/sections/BasicInfoSection";
import CreditAndFinanceSection from "./vendor-form/sections/CreditAndFinanceSection";
import OpeningBalanceSection from "./vendor-form/sections/OpeningBalanceSection";
import OtherSection from "./vendor-form/sections/OtherSection";
import TaxAndComplianceSection from "./vendor-form/sections/TaxAndComplianceSection";

interface VendorFormProps {
  vendor?: Vendor | null;
  onClose: () => void;
}

function VendorFormBody({ vendor, onClose }: VendorFormProps) {
  const { state } = useVendorForm();
  const [formError, setFormError] = useState("");
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();

  const isLoading = isCreating || isUpdating;
  const isEdit = Boolean(vendor);

  const currentLedgerId = useMemo(
    () => createVendorFormState(vendor).basicInfo.ledgerId,
    [vendor],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (
      !state.basicInfo.code.trim() ||
      !state.basicInfo.name.trim() ||
      !state.addressAndContact.address.trim() ||
      !state.addressAndContact.phone.trim() ||
      !state.addressAndContact.email.trim()
    ) {
      setFormError("Code, name, address, phone, and email are required.");
      return;
    }

    if (
      (state.openingBalance.amount.trim() || state.openingBalance.asOfDate) &&
      (!state.openingBalance.amount.trim() || !state.openingBalance.asOfDate)
    ) {
      setFormError(
        "Opening balance amount and date are required when opening balance is enabled.",
      );
      return;
    }

    try {
      const payload = toVendorPayload(state);

      if (vendor) {
        await updateVendor({ id: vendor.id, ...payload }).unwrap();
      } else {
        await createVendor(payload).unwrap();
      }

      onClose();
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to save vendor.";

      setFormError(message ?? "Failed to save vendor.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
    >
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="space-y-8">
          <BasicInfoSection currentLedgerId={currentLedgerId} />
          <AddressAndContactSection />
          <OpeningBalanceSection />
        </div>

        <div className="space-y-8">
          <CreditAndFinanceSection />
          <TaxAndComplianceSection />
          <BankDetailsSection />
          <OtherSection />
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

export default function VendorForm({ vendor, onClose }: VendorFormProps) {
  return (
    <VendorFormProvider vendor={vendor}>
      <VendorFormBody vendor={vendor} onClose={onClose} />
    </VendorFormProvider>
  );
}
