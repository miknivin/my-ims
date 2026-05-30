import { useGetLedgersQuery } from "@/redux/api/ledgerApi";

export type AdditionType = "Addition" | "Deduction";

export interface AdditionRowState {
  rowId: string;
  type: AdditionType;
  ledgerId: string | null;
  ledgerName: string;
  description: string;
  amount: string;
}

export interface AdditionFooterField {
  label: string;
  value: string;
  min?: string;
  step?: string;
  onChange: (value: string) => void;
}

interface AdditionsSectionProps<TAddition extends AdditionRowState> {
  additions: TAddition[];
  onAdd: () => void;
  onUpdate: (rowId: string, changes: Partial<TAddition>) => void;
  onRemove: (rowId: string) => void;
  description: string;
  footerFields?: AdditionFooterField[];
  footerLayoutClassName?: string;
}

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function AdditionsSection<TAddition extends AdditionRowState>({
  additions,
  onAdd,
  onUpdate,
  onRemove,
  description,
  footerFields = [],
  footerLayoutClassName = "grid gap-4 md:grid-cols-2",
}: AdditionsSectionProps<TAddition>) {
  const { data: ledgers = [] } = useGetLedgersQuery();

  return (
    <div className="space-y-4">
      {footerFields.length > 0 ? (
        <div className={footerLayoutClassName}>
          {footerFields.map((field) => (
            <div key={field.label}>
              <label className={labelClass}>{field.label}</label>
              <input
                type="number"
                min={field.min}
                step={field.step ?? "0.01"}
                className={inputClass}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Additions / Deductions
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          Add Adjustment
        </button>
      </div>

      <div className="space-y-3">
        {additions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            No additions yet.
          </div>
        ) : null}

        {additions.map((addition) => (
          <div
            key={addition.rowId}
            className="grid gap-3 rounded-xl border border-gray-200 p-3 dark:border-white/[0.05]"
          >
            <div className="grid gap-3 md:grid-cols-4">
              <select
                className={inputClass}
                value={addition.type}
                onChange={(event) =>
                  onUpdate(addition.rowId, {
                    type: event.target.value as AdditionType,
                  } as Partial<TAddition>)
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
                    (current) => current.id === event.target.value,
                  );

                  onUpdate(addition.rowId, {
                    ledgerId: ledger?.id ?? null,
                    ledgerName: ledger?.name ?? "",
                  } as Partial<TAddition>);
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
                  onUpdate(addition.rowId, {
                    description: event.target.value,
                  } as Partial<TAddition>)
                }
              />

              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={addition.amount}
                onChange={(event) =>
                  onUpdate(addition.rowId, {
                    amount: event.target.value,
                  } as Partial<TAddition>)
                }
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onRemove(addition.rowId)}
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
