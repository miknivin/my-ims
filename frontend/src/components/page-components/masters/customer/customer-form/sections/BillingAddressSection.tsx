import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import TextArea from "../../../../../form/input/TextArea";
import { useCustomerForm } from "../CustomerFormContext";
import SectionCard from "../SectionCard";

export default function BillingAddressSection() {
  const { state, setSection } = useCustomerForm();

  return (
    <SectionCard title="Billing Address">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="mb-2 sm:col-span-2">
          <Label>Street</Label>
          <TextArea value={state.billingAddress.street} onChange={(value) => setSection("billingAddress", { street: value })} rows={3} />
        </div>
        <div className="mb-2">
          <Label>City</Label>
          <Input value={state.billingAddress.city} onChange={(event) => setSection("billingAddress", { city: event.target.value })} />
        </div>
        <div className="mb-2">
          <Label>State</Label>
          <Input value={state.billingAddress.state} onChange={(event) => setSection("billingAddress", { state: event.target.value })} />
        </div>
        <div className="mb-2">
          <Label>Pincode</Label>
          <Input value={state.billingAddress.pincode} onChange={(event) => setSection("billingAddress", { pincode: event.target.value })} />
        </div>
        <div className="mb-2">
          <Label>Country</Label>
          <Input value={state.billingAddress.country} onChange={(event) => setSection("billingAddress", { country: event.target.value })} />
        </div>
      </div>
    </SectionCard>
  );
}
