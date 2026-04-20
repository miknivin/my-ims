import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { useVendorForm } from "../VendorFormContext";
import SectionCard from "../SectionCard";

export default function TaxAndComplianceSection() {
  const { state, setTaxAndCompliance } = useVendorForm();

  return (
    <SectionCard title="Tax & Compliance">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="mb-2">
          <Label>GSTIN</Label>
          <Input
            value={state.taxAndCompliance.gstin}
            onChange={(event) => setTaxAndCompliance({ gstin: event.target.value })}
            placeholder="32ABCDE1234F1Z5"
          />
        </div>
        <div className="mb-2">
          <Label>TIN</Label>
          <Input
            value={state.taxAndCompliance.tin}
            onChange={(event) => setTaxAndCompliance({ tin: event.target.value })}
            placeholder="TIN12345"
          />
        </div>
      </div>
    </SectionCard>
  );
}
