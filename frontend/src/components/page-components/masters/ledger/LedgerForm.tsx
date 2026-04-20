import { FormEvent, useEffect, useMemo, useState } from "react";
import { useGetCurrenciesQuery } from "../../../../app/api/currencyApi";
import {
  Ledger,
  LedgerStatus,
  useCreateLedgerMutation,
  useUpdateLedgerMutation,
} from "../../../../app/api/ledgerApi";
import { useGetLedgerGroupsQuery } from "../../../../app/api/ledgerGroupApi";
import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Button from "../../../ui/button/Button";

interface LedgerFormProps {
  ledger?: Ledger | null;
  onClose: () => void;
}

export default function LedgerForm({ ledger, onClose }: LedgerFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [ledgerGroupId, setLedgerGroupId] = useState("");
  const [defaultCurrencyId, setDefaultCurrencyId] = useState("");
  const [status, setStatus] = useState<LedgerStatus>("Active");
  const [allowManualPosting, setAllowManualPosting] = useState(true);
  const [isBillWise, setIsBillWise] = useState(false);
  const [formError, setFormError] = useState("");
  const { data: ledgerGroups = [] } = useGetLedgerGroupsQuery();
  const { data: currencies = [] } = useGetCurrenciesQuery();
  const [createLedger, { isLoading: isCreating }] = useCreateLedgerMutation();
  const [updateLedger, { isLoading: isUpdating }] = useUpdateLedgerMutation();

  useEffect(() => {
    setCode(ledger?.code ?? "");
    setName(ledger?.name ?? "");
    setAlias(ledger?.alias ?? "");
    setLedgerGroupId(ledger?.ledgerGroupId ?? "");
    setDefaultCurrencyId(ledger?.defaultCurrencyId ?? "");
    setStatus(ledger?.status ?? "Active");
    setAllowManualPosting(ledger?.allowManualPosting ?? true);
    setIsBillWise(ledger?.isBillWise ?? false);
    setFormError("");
  }, [ledger]);

  const activeLedgerGroups = useMemo(
    () =>
      ledgerGroups.filter(
        (item) => item.status === "Active" || item.id === ledger?.ledgerGroupId
      ),
    [ledgerGroups, ledger?.ledgerGroupId]
  );

  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!code.trim() || !name.trim() || !ledgerGroupId) {
      setFormError("Code, name, and ledger group are required.");
      return;
    }

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        alias: alias.trim() || null,
        ledgerGroupId,
        defaultCurrencyId: defaultCurrencyId || null,
        status,
        allowManualPosting,
        isBillWise,
      };

      if (ledger) {
        await updateLedger({ id: ledger.id, ...payload }).unwrap();
      } else {
        await createLedger(payload).unwrap();
      }

      onClose();
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to save ledger.";

      setFormError(message ?? "Failed to save ledger.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {ledger ? "Edit Ledger" : "Add Ledger"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Capture the ledger identity and control flags without storing dated balances here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label>
            Code<span className="text-error-500">*</span>
          </Label>
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="CASH001"
          />
        </div>
        <div>
          <Label>
            Status<span className="text-error-500">*</span>
          </Label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as LedgerStatus)}
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
          <Label>Alias</Label>
          <Input
            value={alias}
            onChange={(event) => setAlias(event.target.value)}
            placeholder="Main cash account"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label>
            Ledger Group<span className="text-error-500">*</span>
          </Label>
          <select
            value={ledgerGroupId}
            onChange={(event) => setLedgerGroupId(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="">Select a ledger group</option>
            {activeLedgerGroups.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.nature})
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Default Currency</Label>
          <select
            value={defaultCurrencyId}
            onChange={(event) => setDefaultCurrencyId(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="">Select a default currency</option>
            {currencies.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code} - {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 p-4 dark:border-white/[0.05] sm:grid-cols-2">
        <label className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={allowManualPosting}
            onChange={(event) => setAllowManualPosting(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20"
          />
          <span>Allow manual posting</span>
        </label>
        <label className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={isBillWise}
            onChange={(event) => setIsBillWise(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20"
          />
          <span>Bill-wise tracking</span>
        </label>
      </div>

      {formError ? <p className="text-sm text-error-500">{formError}</p> : null}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button className="min-w-28" disabled={isLoading}>
          {isLoading ? "Saving..." : ledger ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
