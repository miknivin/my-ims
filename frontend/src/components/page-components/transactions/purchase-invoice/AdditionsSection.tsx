import { useGetLedgersQuery } from "../../../../app/api/ledgerApi";
import { usePurchaseInvoiceForm } from "./PurchaseInvoiceFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function AdditionsSection() {
  const { state, addAddition, updateAddition, removeAddition } =
    usePurchaseInvoiceForm();
  const { data: ledgers = [] } = useGetLedgersQuery();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Additions / Deductions
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Capture freight, ledger-linked charges, and invoice deductions here.
          </p>
        </div>
        <button
          type="button"
          onClick={addAddition}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          Add Adjustment
        </button>
      </div>

      <div className="space-y-3">
        {state.additions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            No additions yet.
          </div>
        ) : null}

        {state.additions.map((addition) => (
          <div
            key={addition.rowId}
            className="grid gap-3 rounded-xl border border-gray-200 p-3 dark:border-white/[0.05]"
          >
            <div className="grid gap-3 md:grid-cols-4">
              <select
                className={inputClass}
                value={addition.type}
                onChange={(event) =>
                  updateAddition(addition.rowId, {
                    type: event.target.value as "Addition" | "Deduction",
                  })
                }
              >
                <option value="Addition">Addition</option>
                <option value="Deduction">Deduction</option>
              </select>
              <select
                className={inputClass}
                value={addition.ledgerId ?? ""}
                onChange={(event) => {
                  const ledger = ledgers.find(
                    (item) => item.id === event.target.value,
                  );

                  updateAddition(addition.rowId, {
                    ledgerId: ledger?.id ?? null,
                    ledgerName: ledger?.name ?? "",
                  });
                }}
              >
                <option value="">Select ledger</option>
                {ledgers.map((ledger) => (
                  <option key={ledger.id} value={ledger.id}>
                    {ledger.name}
                  </option>
                ))}
              </select>
              <input
                className={inputClass}
                placeholder="Description"
                value={addition.description}
                onChange={(event) =>
                  updateAddition(addition.rowId, {
                    description: event.target.value,
                  })
                }
              />
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={addition.amount}
                onChange={(event) =>
                  updateAddition(addition.rowId, { amount: event.target.value })
                }
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeAddition(addition.rowId)}
                className="text-sm font-medium text-red-600 transition hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Remove row
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
