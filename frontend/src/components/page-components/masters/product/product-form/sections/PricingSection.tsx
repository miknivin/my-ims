import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { useProductForm } from "../ProductFormContext";
import SectionCard from "../SectionCard";

const fields = [
  ["profitPercentage", "Profit %"],
  ["purchaseRate", "Purchase Rate"],
  ["cost", "Cost"],
  ["salesRate", "Sales Rate"],
  ["normalRate", "Normal Rate"],
  ["mrp", "MRP"],
  ["wholesaleRate", "Wholesale Rate"],
] as const;

export default function PricingSection() {
  const { state, setSection } = useProductForm();
  return (
    <SectionCard title="Pricing & Rates">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map(([key, label]) => (
          <div className="mb-2" key={key}>
            <Label>{label}</Label>
            <Input value={state.pricingAndRates[key]} onChange={(event) => setSection("pricingAndRates", { [key]: event.target.value })} type="number" placeholder="0.00" />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
