import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { useVendorForm } from "../VendorFormContext";
import SectionCard from "../SectionCard";

export default function OtherSection() {
  const { state, setOther } = useVendorForm();

  return (
    <SectionCard title="Other">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="mb-2 sm:col-span-2">
          <Label>Company</Label>
          <Input
            value={state.other.company}
            onChange={(event) => setOther({ company: event.target.value })}
            placeholder="ABC Group"
          />
        </div>
      </div>
    </SectionCard>
  );
}
