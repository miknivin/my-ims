import { useMemo } from "react";
import { LedgerGroup, useGetLedgerGroupsQuery } from "../../../../../../app/api/ledgerGroupApi";
import { VendorStatus } from "../../../../../../app/api/vendorApi";
import AutocompleteSelect from "../../../../../form/AutocompleteSelect";
import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { useVendorForm } from "../VendorFormContext";
import SectionCard from "../SectionCard";

export default function BasicInfoSection({ currentLedgerGroupId }: { currentLedgerGroupId?: string | null }) {
  const { state, setBasicInfo } = useVendorForm();
  const { data: ledgerGroups = [] } = useGetLedgerGroupsQuery();

  const availableLedgerGroups = ledgerGroups.filter(
    (item) =>
      item.nature === "Liability" &&
      (item.status === "Active" || item.id === currentLedgerGroupId)
  );

  const selectedLedgerGroupLabel = useMemo(() => {
    const selectedLedgerGroup = availableLedgerGroups.find(
      (item) => item.id === state.basicInfo.ledgerGroupId,
    );

    return selectedLedgerGroup ? `${selectedLedgerGroup.code} - ${selectedLedgerGroup.name}` : "";
  }, [availableLedgerGroups, state.basicInfo.ledgerGroupId]);

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
          <Label>
            Ledger Group<span className="text-error-500">*</span>
          </Label>
          <AutocompleteSelect<LedgerGroup, LedgerGroup[]>
            value={selectedLedgerGroupLabel}
            placeholder="Search liability ledger group"
            search={(keyword) => {
              const normalizedKeyword = keyword.trim().toLowerCase();

              return availableLedgerGroups
                .filter((item) => {
                  if (!normalizedKeyword) {
                    return true;
                  }

                  return (
                    item.code.toLowerCase().includes(normalizedKeyword) ||
                    item.name.toLowerCase().includes(normalizedKeyword)
                  );
                })
                .slice(0, 10);
            }}
            getItems={(result) => result}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) => `${item.code} - ${item.name}`}
            onInputChange={(value) => {
              if (!value.trim()) {
                setBasicInfo({ ledgerGroupId: "" });
              }
            }}
            onSelect={(item) => setBasicInfo({ ledgerGroupId: item?.id ?? "" })}
          />
        </div>
      </div>
    </SectionCard>
  );
}
