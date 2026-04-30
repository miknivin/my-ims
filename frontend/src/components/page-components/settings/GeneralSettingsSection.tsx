import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import { useSettingsForm } from "./SettingsFormContext";

export default function GeneralSettingsSection() {
  const { state, setGeneral } = useSettingsForm();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          value={state.general.businessName}
          onChange={(event) => setGeneral({ businessName: event.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="contactPerson">Contact Person</Label>
        <Input
          id="contactPerson"
          value={state.general.contactPerson}
          onChange={(event) => setGeneral({ contactPerson: event.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={state.general.phone}
          onChange={(event) => setGeneral({ phone: event.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={state.general.email}
          onChange={(event) => setGeneral({ email: event.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="gstin">GSTIN</Label>
        <Input
          id="gstin"
          value={state.general.gstin}
          onChange={(event) => setGeneral({ gstin: event.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="pan">PAN</Label>
        <Input
          id="pan"
          value={state.general.pan}
          onChange={(event) => setGeneral({ pan: event.target.value })}
        />
      </div>
      <div className="lg:col-span-2">
        <Label htmlFor="addressLine1">Address Line 1</Label>
        <Input
          id="addressLine1"
          value={state.general.addressLine1}
          onChange={(event) => setGeneral({ addressLine1: event.target.value })}
        />
      </div>
      <div className="lg:col-span-2">
        <Label htmlFor="addressLine2">Address Line 2</Label>
        <Input
          id="addressLine2"
          value={state.general.addressLine2}
          onChange={(event) => setGeneral({ addressLine2: event.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          value={state.general.city}
          onChange={(event) => setGeneral({ city: event.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="state">State</Label>
        <Input
          id="state"
          value={state.general.state}
          onChange={(event) => setGeneral({ state: event.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="pincode">Pincode</Label>
        <Input
          id="pincode"
          value={state.general.pincode}
          onChange={(event) => setGeneral({ pincode: event.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          value={state.general.country}
          onChange={(event) => setGeneral({ country: event.target.value })}
        />
      </div>
    </div>
  );
}
