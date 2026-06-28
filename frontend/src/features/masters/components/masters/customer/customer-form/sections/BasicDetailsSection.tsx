import { LedgerGroup, useLazyGetLedgerGroupsQuery } from "@/redux/api/ledgerGroupApi";
import { CustomerStatus, CustomerType } from "@/redux/api/customerApi";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import CodeInput from "@/shared/components/form/CodeInput";
import Label from "@/shared/components/form/Label";
import Input from "@/shared/components/form/input/InputField";
import { useCustomerForm } from "../CustomerFormContext";
import SectionCard from "../SectionCard";

const customerTypes: CustomerType[] = [
  "Walk-in",
  "Regular",
  "Wholesale",
  "Distributor",
  "Dealer",
  "Retail",
  "Corporate",
  "Government",
];

export default function BasicDetailsSection() {
  const { state, setSection } = useCustomerForm();
  const [searchGroups] = useLazyGetLedgerGroupsQuery();

  return (
    <SectionCard title="Basic Details">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="mb-2">
          <CodeInput entity="customer" label="Code" required value={state.basicDetails.code} onChange={(value) => setSection("basicDetails", { code: value })} placeholder="CUST001" />
        </div>
        <div className="mb-2">
          <Label>Name<span className="text-error-500">*</span></Label>
          <Input value={state.basicDetails.name} onChange={(event) => setSection("basicDetails", { name: event.target.value })} placeholder="Acme Retail" />
        </div>
        <div className="mb-2">
          <Label>Alias</Label>
          <Input value={state.basicDetails.alias} onChange={(event) => setSection("basicDetails", { alias: event.target.value })} placeholder="Acme" />
        </div>
        <div className="mb-2">
          <Label>Customer Type</Label>
          <select value={state.basicDetails.customerType} onChange={(event) => setSection("basicDetails", { customerType: event.target.value as CustomerType })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
            {customerTypes.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <Label>Status</Label>
          <select value={state.basicDetails.status} onChange={(event) => setSection("basicDetails", { status: event.target.value as CustomerStatus })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="mb-2">
          <Label>Ledger Group<span className="text-error-500">*</span></Label>
          <AutocompleteSelect<LedgerGroup, LedgerGroup[]>
            value={state.basicDetails.ledgerGroupLabel}
            placeholder="Search asset ledger group"
            search={(keyword) =>
              searchGroups({ keyword, nature: "Asset", limit: 10 }).unwrap().then((r) => r.items)
            }
            getItems={(result) => result}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) => `${item.code} - ${item.name}`}
            onInputChange={(value) => {
              if (!value.trim()) {
                setSection("basicDetails", { ledgerGroupId: "", ledgerGroupLabel: "" });
              }
            }}
            onSelect={(item) => {
              setSection("basicDetails", {
                ledgerGroupId: item?.id ?? "",
                ledgerGroupLabel: item ? `${item.code} - ${item.name}` : "",
              });
            }}
          />
        </div>
      </div>
    </SectionCard>
  );
}
