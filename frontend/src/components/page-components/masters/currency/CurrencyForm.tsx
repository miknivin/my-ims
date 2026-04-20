import { FormEvent, useEffect, useState } from "react";
import {
  Currency,
  CurrencyStatus,
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
} from "../../../../app/api/currencyApi";
import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Button from "../../../ui/button/Button";

interface CurrencyFormProps {
  currency?: Currency | null;
  onClose: () => void;
}

export default function CurrencyForm({ currency, onClose }: CurrencyFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [status, setStatus] = useState<CurrencyStatus>("Active");
  const [formError, setFormError] = useState("");
  const [createCurrency, { isLoading: isCreating }] = useCreateCurrencyMutation();
  const [updateCurrency, { isLoading: isUpdating }] = useUpdateCurrencyMutation();

  useEffect(() => {
    setCode(currency?.code ?? "");
    setName(currency?.name ?? "");
    setSymbol(currency?.symbol ?? "");
    setStatus(currency?.status ?? "Active");
    setFormError("");
  }, [currency]);

  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!code.trim() || !name.trim() || !symbol.trim()) {
      setFormError("Code, name, and symbol are required.");
      return;
    }

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        symbol: symbol.trim(),
        status,
      };

      if (currency) {
        await updateCurrency({ id: currency.id, ...payload }).unwrap();
      } else {
        await createCurrency(payload).unwrap();
      }

      onClose();
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to save currency.";

      setFormError(message ?? "Failed to save currency.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {currency ? "Edit Currency" : "Add Currency"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Capture the currency code, display name, symbol, and status.
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
            placeholder="INR"
          />
        </div>
        <div>
          <Label>
            Symbol<span className="text-error-500">*</span>
          </Label>
          <Input
            value={symbol}
            onChange={(event) => setSymbol(event.target.value)}
            placeholder="Rs"
          />
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
            placeholder="Indian Rupee"
          />
        </div>
        <div>
          <Label>
            Status<span className="text-error-500">*</span>
          </Label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as CurrencyStatus)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {formError ? <p className="text-sm text-error-500">{formError}</p> : null}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button className="min-w-28" disabled={isLoading}>
          {isLoading ? "Saving..." : currency ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
