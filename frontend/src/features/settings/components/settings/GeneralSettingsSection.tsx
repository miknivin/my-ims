import Label from "@/shared/components/form/Label";
import Input from "@/shared/components/form/input/InputField";
import { useSettingsForm } from "./SettingsFormContext";

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "India Standard Time (IST, UTC+5:30)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET, UTC-5/-4)" },
  { value: "America/Chicago", label: "Central Time (CT, UTC-6/-5)" },
  { value: "America/Denver", label: "Mountain Time (MT, UTC-7/-6)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT, UTC-8/-7)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT/BST)" },
  { value: "Europe/Paris", label: "Central European Time (CET, UTC+1/+2)" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (GST, UTC+4)" },
  { value: "Asia/Singapore", label: "Singapore Time (SGT, UTC+8)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST, UTC+9)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AEST, UTC+10/+11)" },
];

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
      <div>
        <Label htmlFor="timeZoneId">Timezone</Label>
        <select
          id="timeZoneId"
          value={state.general.timeZoneId}
          onChange={(event) => setGeneral({ timeZoneId: event.target.value })}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
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
