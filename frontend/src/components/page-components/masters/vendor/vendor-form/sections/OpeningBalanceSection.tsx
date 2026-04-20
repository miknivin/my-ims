import { BalanceType } from "../../../../../../app/api/vendorApi";
import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { useVendorForm } from "../VendorFormContext";
import SectionCard from "../SectionCard";

export default function OpeningBalanceSection() {
  const { state, setOpeningBalance } = useVendorForm();

  return (
    <SectionCard title="Opening Balance">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="mb-2">
            <Label>Amount</Label>
            <Input
              value={state.openingBalance.amount}
              onChange={(event) =>
                setOpeningBalance({ amount: event.target.value })
              }
              type="number"
              placeholder="0.00"
            />
          </div>
          <div className="mb-2">
            <Label>Type</Label>
            <select
              value={state.openingBalance.balanceType}
              onChange={(event) =>
                setOpeningBalance({
                  balanceType: event.target.value as BalanceType,
                })
              }
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="Dr">Dr</option>
              <option value="Cr">Cr</option>
            </select>
          </div>
          <div className="mb-2">
            <Label>As Of Date</Label>
            <input
              type="date"
              value={state.openingBalance.asOfDate}
              onChange={(event) =>
                setOpeningBalance({ asOfDate: event.target.value })
              }
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
