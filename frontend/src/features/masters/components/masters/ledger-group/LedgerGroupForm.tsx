import { FormEvent, useEffect, useState } from "react";
import {
  LedgerGroup,
  LedgerGroupNature,
  LedgerGroupStatus,
  useCreateLedgerGroupMutation,
  useLazyGetLedgerGroupsQuery,
  useUpdateLedgerGroupMutation,
} from "@/redux/api/ledgerGroupApi";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import CodeInput from "@/shared/components/form/CodeInput";
import Label from "@/shared/components/form/Label";
import Input from "@/shared/components/form/input/InputField";
import Button from "@/shared/components/ui/button/Button";

interface LedgerGroupFormProps {
  ledgerGroup?: LedgerGroup | null;
  onClose: () => void;
}

const natures: LedgerGroupNature[] = ["Asset", "Liability", "Income", "Expense", "Equity"];

export default function LedgerGroupForm({ ledgerGroup, onClose }: LedgerGroupFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [nature, setNature] = useState<LedgerGroupNature>("Asset");
  const [parentGroupId, setParentGroupId] = useState("");
  const [parentGroupLabel, setParentGroupLabel] = useState("");
  const [status, setStatus] = useState<LedgerGroupStatus>("Active");
  const [formError, setFormError] = useState("");
  const [searchGroups] = useLazyGetLedgerGroupsQuery();
  const [createLedgerGroup, { isLoading: isCreating }] = useCreateLedgerGroupMutation();
  const [updateLedgerGroup, { isLoading: isUpdating }] = useUpdateLedgerGroupMutation();

  useEffect(() => {
    setCode(ledgerGroup?.code ?? "");
    setName(ledgerGroup?.name ?? "");
    setNature(ledgerGroup?.nature ?? "Asset");
    setParentGroupId(ledgerGroup?.parentGroupId ?? "");
    setParentGroupLabel(ledgerGroup?.parentGroupName ?? "");
    setStatus(ledgerGroup?.status ?? "Active");
    setFormError("");
  }, [ledgerGroup]);

  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!code.trim() || !name.trim()) {
      setFormError("Code and name are required.");
      return;
    }

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        nature,
        parentGroupId: parentGroupId || null,
        status,
      };

      if (ledgerGroup) {
        await updateLedgerGroup({ id: ledgerGroup.id, ...payload }).unwrap();
      } else {
        await createLedgerGroup(payload).unwrap();
      }

      onClose();
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to save ledger group.";

      setFormError(message ?? "Failed to save ledger group.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {ledgerGroup ? "Edit Ledger Group" : "Add Ledger Group"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Define the account hierarchy that ledgers will roll up under.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <CodeInput
            entity="ledger-group"
            label="Code"
            required
            value={code}
            onChange={setCode}
            placeholder="CASH"
          />
        </div>
        <div>
          <Label>
            Status<span className="text-error-500">*</span>
          </Label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as LedgerGroupStatus)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label>
            Name<span className="text-error-500">*</span>
          </Label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Cash in Hand"
          />
        </div>
        <div>
          <Label>
            Nature<span className="text-error-500">*</span>
          </Label>
          <select
            value={nature}
            onChange={(event) => {
              setNature(event.target.value as LedgerGroupNature);
              setParentGroupId("");
              setParentGroupLabel("");
            }}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            {natures.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label>Parent Group</Label>
        <AutocompleteSelect<LedgerGroup, LedgerGroup[]>
          selectedKey={parentGroupId || null}
          value={parentGroupLabel}
          placeholder="Search parent ledger group"
          search={(keyword) =>
            searchGroups({ keyword, nature, limit: 10 }).unwrap().then((result) =>
              result.items.filter((item) => item.id !== ledgerGroup?.id)
            )
          }
          getItems={(result) => result}
          getOptionKey={(item) => item.id}
          getOptionLabel={(item) => `${item.code} - ${item.name}`}
          onInputChange={(value) => {
            if (!value.trim()) {
              setParentGroupId("");
              setParentGroupLabel("");
            }
          }}
          onSelect={(item) => {
            setParentGroupId(item?.id ?? "");
            setParentGroupLabel(item ? `${item.code} - ${item.name}` : "");
          }}
        />
      </div>

      {formError ? <p className="text-sm text-error-500">{formError}</p> : null}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button className="min-w-28" disabled={isLoading}>
          {isLoading ? "Saving..." : ledgerGroup ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
