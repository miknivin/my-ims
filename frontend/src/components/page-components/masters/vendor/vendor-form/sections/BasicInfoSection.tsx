import { useGetLedgersQuery } from "../../../../../../app/api/ledgerApi";
import { VendorStatus } from "../../../../../../app/api/vendorApi";
import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { useVendorForm } from "../VendorFormContext";
import SectionCard from "../SectionCard";

export default function BasicInfoSection({ currentLedgerId }: { currentLedgerId?: string | null }) {
  const { state, setBasicInfo } = useVendorForm();
  const { data: ledgers = [] } = useGetLedgersQuery();

  const availableLedgers = ledgers.filter(
    (item) => item.status === "Active" || item.id === currentLedgerId
  );

  return (
    <SectionCard title="Basic Info">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="mb-2">
          <Label>
            Code<span className="text-error-500">*</span>
          </Label>
          <Input
            value={state.basicInfo.code}
            onChange={(event) => setBasicInfo({ code: event.target.value })}
            placeholder="VEND001"
          />
        </div>
        <div className="mb-2">
          <Label>
            Name<span className="text-error-500">*</span>
          </Label>
          <Input
            value={state.basicInfo.name}
            onChange={(event) => setBasicInfo({ name: event.target.value })}
            placeholder="ABC Supplies"
          />
        </div>
        <div className="mb-2">
          <Label>Under</Label>
          <Input
            value={state.basicInfo.under}
            onChange={(event) => setBasicInfo({ under: event.target.value })}
            placeholder="Sundry Creditors"
          />
        </div>
        <div className="mb-2">
          <Label>
            Status<span className="text-error-500">*</span>
          </Label>
          <select
            value={state.basicInfo.status}
            onChange={(event) => setBasicInfo({ status: event.target.value as VendorStatus })}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="mb-2">
          <Label>Linked Ledger</Label>
          <select
            value={state.basicInfo.ledgerId}
            onChange={(event) => setBasicInfo({ ledgerId: event.target.value })}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="">Select a ledger</option>
            {availableLedgers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code} - {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </SectionCard>
  );
}
