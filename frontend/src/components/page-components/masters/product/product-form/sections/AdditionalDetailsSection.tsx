import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { useProductForm } from "../ProductFormContext";
import SectionCard from "../SectionCard";

const fields = [
  ["packUnit", "Pack Unit"],
  ["additionPercentage", "Addition %"],
  ["addition", "Addition"],
  ["company", "Company"],
  ["warehouseStock", "Warehouse Stock"],
  ["document", "Document"],
  ["barcode", "Barcode"],
  ["purchaseHistory", "Purchase History"],
  ["salesHistory", "Sales History"],
  ["companyStock", "Company Stock"],
] as const;

export default function AdditionalDetailsSection() {
  const { state, setSection } = useProductForm();
  return (
    <SectionCard title="Additional Details">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map(([key, label]) => (
          <div className="mb-2" key={key}>
            <Label>{label}</Label>
            <Input
              value={state.additionalDetails[key]}
              onChange={(event) => setSection("additionalDetails", { [key]: event.target.value })}
              type={["packUnit", "additionPercentage", "addition"].includes(key) ? "number" : "text"}
              placeholder={label}
            />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
