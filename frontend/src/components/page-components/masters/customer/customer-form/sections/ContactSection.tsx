import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { useCustomerForm } from "../CustomerFormContext";
import SectionCard from "../SectionCard";

export default function ContactSection() {
  const { state, setSection } = useCustomerForm();

  return (
    <SectionCard title="Contact">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="mb-2">
          <Label>Phone</Label>
          <Input value={state.contact.phone} onChange={(event) => setSection("contact", { phone: event.target.value })} placeholder="044-123456" />
        </div>
        <div className="mb-2">
          <Label>Mobile</Label>
          <Input value={state.contact.mobile} onChange={(event) => setSection("contact", { mobile: event.target.value })} placeholder="+91 9876543210" />
        </div>
        <div className="mb-2">
          <Label>Email</Label>
          <Input type="email" value={state.contact.email} onChange={(event) => setSection("contact", { email: event.target.value })} placeholder="accounts@customer.com" />
        </div>
        <div className="mb-2">
          <Label>Website</Label>
          <Input value={state.contact.website} onChange={(event) => setSection("contact", { website: event.target.value })} placeholder="https://example.com" />
        </div>
      </div>
    </SectionCard>
  );
}
