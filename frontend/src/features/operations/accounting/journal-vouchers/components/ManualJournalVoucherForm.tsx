import { FormEvent, useMemo, useState } from "react";
import { useLazySearchLookupQuery } from "@/redux/api/lookupApi";
import { CreateManualJournalVoucherPayload } from "@/redux/api/journalVoucherApi";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import Button from "@/shared/components/ui/button/Button";
import { LookupOption } from "@/shared/types/filtering";
import TransactionHeaderGrid from "@/features/operations/shared/TransactionHeaderGrid";
import TransactionSectionCard from "@/features/operations/shared/TransactionSectionCard";

interface ManualJournalVoucherFormProps {
  isPosting?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onSubmit: (payload: CreateManualJournalVoucherPayload) => Promise<void>;
}

interface EntryRow {
  key: string;
  ledgerId: string;
  ledgerName: string;
  debitAmount: string;
  creditAmount: string;
}

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass =
  "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

const createEmptyRow = (): EntryRow => ({
  key: crypto.randomUUID(),
  ledgerId: "",
  ledgerName: "",
  debitAmount: "",
  creditAmount: "",
});

const defaultDate = () => new Date().toISOString().slice(0, 10);

export default function ManualJournalVoucherForm({
  isPosting = false,
  errorMessage,
  onCancel,
  onSubmit,
}: ManualJournalVoucherFormProps) {
  const [voucherNo, setVoucherNo] = useState("");
  const [postingDate, setPostingDate] = useState(defaultDate());
  const [narration, setNarration] = useState("");
  const [rows, setRows] = useState<EntryRow[]>([
    createEmptyRow(),
    createEmptyRow(),
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchLookup] = useLazySearchLookupQuery();

  const totals = useMemo(
    () =>
      rows.reduce(
        (sum, row) => ({
          debit: sum.debit + toAmount(row.debitAmount),
          credit: sum.credit + toAmount(row.creditAmount),
        }),
        { debit: 0, credit: 0 },
      ),
    [rows],
  );

  const difference = Number((totals.debit - totals.credit).toFixed(2));
  const isBalanced = totals.debit > 0 && difference === 0;

  const updateRow = (key: string, patch: Partial<EntryRow>) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const removeRow = (key: string) => {
    setRows((current) =>
      current.length <= 2 ? current : current.filter((row) => row.key !== key),
    );
  };

  const reset = () => {
    setVoucherNo("");
    setPostingDate(defaultDate());
    setNarration("");
    setRows([createEmptyRow(), createEmptyRow()]);
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const effectiveRows = rows.filter(
      (row) => toAmount(row.debitAmount) > 0 || toAmount(row.creditAmount) > 0,
    );

    if (!voucherNo.trim()) {
      setFormError("Voucher number is required.");
      return;
    }

    if (!postingDate) {
      setFormError("Posting date is required.");
      return;
    }

    if (effectiveRows.length < 2) {
      setFormError("Add at least two non-zero lines.");
      return;
    }

    if (effectiveRows.some((row) => !row.ledgerId)) {
      setFormError("Select ledger for every non-zero line.");
      return;
    }

    if (
      effectiveRows.some(
        (row) => toAmount(row.debitAmount) > 0 && toAmount(row.creditAmount) > 0,
      )
    ) {
      setFormError("One line cannot contain both debit and credit.");
      return;
    }

    if (!isBalanced) {
      setFormError("Debit and credit totals must match.");
      return;
    }

    setFormError(null);
    await onSubmit({
      voucherNo: voucherNo.trim(),
      postingDate,
      narration: narration.trim() || null,
      entries: effectiveRows.map((row) => ({
        ledgerId: row.ledgerId,
        debitAmount: toAmount(row.debitAmount),
        creditAmount: toAmount(row.creditAmount),
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TransactionHeaderGrid>
        <TransactionSectionCard title="Document Details">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Voucher No</label>
              <input
                className={inputClass}
                value={voucherNo}
                onChange={(event) => setVoucherNo(event.target.value)}
                placeholder="JV-0001"
              />
            </div>
            <div>
              <label className={labelClass}>Posting Date</label>
              <input
                type="date"
                className={inputClass}
                value={postingDate}
                onChange={(event) => setPostingDate(event.target.value)}
              />
            </div>
          </div>
        </TransactionSectionCard>

        <TransactionSectionCard title="Narration">
          <label className={labelClass}>Narration</label>
          <textarea
            value={narration}
            onChange={(event) => setNarration(event.target.value)}
            placeholder="Reason for this manual journal"
            className={`${inputClass} min-h-28 resize-y py-3`}
          />
        </TransactionSectionCard>
      </TransactionHeaderGrid>

      <TransactionSectionCard title="Journal Lines">
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-white/[0.03]">
              <tr>
                {["Ledger", "Debit", "Credit", ""].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="min-w-72 px-4 py-3">
                    <AutocompleteSelect<LookupOption, LookupOption[]>
                      value={row.ledgerName}
                      placeholder="Search ledger"
                      search={(keyword) =>
                        searchLookup({ source: "ledgers", keyword, limit: 10 })
                      }
                      getItems={(result) => result}
                      getOptionKey={(item) => item.id}
                      getOptionLabel={(item) =>
                        item.secondaryLabel
                          ? `${item.label} (${item.secondaryLabel})`
                          : item.label
                      }
                      onInputChange={(value) =>
                        updateRow(row.key, {
                          ledgerName: value,
                          ledgerId: "",
                        })
                      }
                      onSelect={(item) =>
                        updateRow(row.key, {
                          ledgerId: item?.id ?? "",
                          ledgerName: item
                            ? item.secondaryLabel
                              ? `${item.label} (${item.secondaryLabel})`
                              : item.label
                            : "",
                        })
                      }
                    />
                  </td>
                  <td className="w-44 px-4 py-3">
                    <AmountInput
                      value={row.debitAmount}
                      disabled={toAmount(row.creditAmount) > 0}
                      onChange={(value) =>
                        updateRow(row.key, { debitAmount: value })
                      }
                    />
                  </td>
                  <td className="w-44 px-4 py-3">
                    <AmountInput
                      value={row.creditAmount}
                      disabled={toAmount(row.debitAmount) > 0}
                      onChange={(value) =>
                        updateRow(row.key, { creditAmount: value })
                      }
                    />
                  </td>
                  <td className="w-24 px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      disabled={rows.length <= 2}
                      className="text-sm font-medium text-gray-500 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
              <tr>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                  Total
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  {formatAmount(totals.debit)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  {formatAmount(totals.credit)}
                </td>
                <td className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                  {isBalanced ? "Balanced" : `Diff ${formatAmount(Math.abs(difference))}`}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-4 flex justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={() => setRows((current) => [...current, createEmptyRow()])}
            disabled={isPosting}
          >
            Add Line
          </Button>
        </div>
      </TransactionSectionCard>

      {formError || errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {formError || errorMessage}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 dark:border-white/[0.05] dark:bg-gray-900">
        <Button type="button" variant="outline" onClick={onCancel}>
          Back
        </Button>
        <Button type="button" variant="outline" onClick={reset}>
          Reset
        </Button>
        <Button className="min-w-36" disabled={isPosting || !isBalanced}>
          {isPosting ? "Posting..." : "Post Voucher"}
        </Button>
      </div>
    </form>
  );
}

function AmountInput({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="number"
      min="0"
      step="0.01"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-right text-sm text-gray-800 outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:text-white/90 dark:disabled:bg-gray-800"
    />
  );
}

function toAmount(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function formatAmount(value: number) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
