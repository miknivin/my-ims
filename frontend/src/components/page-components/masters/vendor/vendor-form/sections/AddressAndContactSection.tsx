import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import TextArea from "../../../../../form/input/TextArea";
import { useVendorForm } from "../VendorFormContext";
import SectionCard from "../SectionCard";

export default function AddressAndContactSection() {
  const { state, setAddressAndContact } = useVendorForm();

  return (
    <SectionCard title="Address & Contact">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="mb-2">
          <Label>Contact Name</Label>
          <Input
            value={state.addressAndContact.contactName}
            onChange={(event) => setAddressAndContact({ contactName: event.target.value })}
            placeholder="John Doe"
          />
        </div>
        <div className="mb-2">
          <Label>Name in OL</Label>
          <Input
            value={state.addressAndContact.nameInOl}
            onChange={(event) => setAddressAndContact({ nameInOl: event.target.value })}
            placeholder="ABC Supplies LLC"
          />
        </div>
        <div className="mb-2 sm:col-span-2">
          <Label>
            Address<span className="text-error-500">*</span>
          </Label>
          <TextArea
            value={state.addressAndContact.address}
            onChange={(value) => setAddressAndContact({ address: value })}
            rows={4}
          />
        </div>
        <div className="mb-2">
          <Label>
            Phone<span className="text-error-500">*</span>
          </Label>
          <Input
            value={state.addressAndContact.phone}
            onChange={(event) => setAddressAndContact({ phone: event.target.value })}
            placeholder="0484-1234567"
          />
        </div>
        <div className="mb-2">
          <Label>Mobile</Label>
          <Input
            value={state.addressAndContact.mobile}
            onChange={(event) => setAddressAndContact({ mobile: event.target.value })}
            placeholder="+91 9876543210"
          />
        </div>
        <div className="mb-2">
          <Label>
            Email<span className="text-error-500">*</span>
          </Label>
          <Input
            value={state.addressAndContact.email}
            onChange={(event) => setAddressAndContact({ email: event.target.value })}
            placeholder="accounts@abc.com"
          />
        </div>
        <div className="mb-2">
          <Label>Website</Label>
          <Input
            value={state.addressAndContact.web}
            onChange={(event) => setAddressAndContact({ web: event.target.value })}
            placeholder="https://abc.com"
          />
        </div>
        <div className="mb-2">
          <Label>Fax</Label>
          <Input
            value={state.addressAndContact.fax}
            onChange={(event) => setAddressAndContact({ fax: event.target.value })}
            placeholder="0484-7654321"
          />
        </div>
      </div>
    </SectionCard>
  );
}
