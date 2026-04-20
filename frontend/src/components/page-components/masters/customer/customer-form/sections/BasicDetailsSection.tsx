import { useGetLedgersQuery } from "../../../../../../app/api/ledgerApi";
import { CustomerStatus, CustomerType } from "../../../../../../app/api/customerApi";
import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
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

export default function BasicDetailsSection({ currentLedgerId }: { currentLedgerId?: string | null }) {
  const { state, setSection } = useCustomerForm();
  const { data: ledgers = [] } = useGetLedgersQuery();
  const availableLedgers = ledgers.filter((item) => item.status === "Active" || item.id === currentLedgerId);

  return (
    <SectionCard title="Basic Details">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="mb-2">
          <Label>Code<span className="text-error-500">*</span></Label>
          <Input value={state.basicDetails.code} onChange={(event) => setSection("basicDetails", { code: event.target.value })} placeholder="CUST001" />
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
          <Label>Category</Label>
          <Input value={state.basicDetails.category} onChange={(event) => setSection("basicDetails", { category: event.target.value })} placeholder="Retail" />
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
        <div className="mb-2 sm:col-span-2">
          <Label>Linked Ledger</Label>
          <select value={state.basicDetails.ledgerId} onChange={(event) => setSection("basicDetails", { ledgerId: event.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
            <option value="">Select a ledger</option>
            {availableLedgers.map((item) => (
              <option key={item.id} value={item.id}>{item.code} - {item.name}</option>
            ))}
          </select>
        </div>
      </div>
    </SectionCard>
  );
}
