import { useEffect, useState } from "react";
import { LedgerGroup, useLazyGetLedgerGroupsQuery } from "@/redux/api/ledgerGroupApi";
import { Customer, CustomerType, useCreateCustomerMutation } from "@/redux/api/customerApi";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import CodeInput from "@/shared/components/form/CodeInput";
import { Modal } from "@/shared/components/ui/modal";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";
const errorClass = "text-sm text-red-500 dark:text-red-400";

const CUSTOMER_TYPES: CustomerType[] = [
  "Walk-in", "Regular", "Wholesale", "Distributor",
  "Dealer", "Retail", "Corporate", "Government",
];

interface Props {
  open: boolean;
  keyword: string;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
}

export default function QuickAddCustomerModal({ open, keyword, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [ledgerGroupId, setLedgerGroupId] = useState("");
  const [ledgerGroupLabel, setLedgerGroupLabel] = useState("");
  const [customerType, setCustomerType] = useState<CustomerType>("Regular");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const [createCustomer, { isLoading }] = useCreateCustomerMutation();
  const [searchGroups] = useLazyGetLedgerGroupsQuery();

  useEffect(() => {
    if (open) {
      setName(keyword);
      setCode("");
      setLedgerGroupId("");
      setLedgerGroupLabel("");
      setCustomerType("Regular");
      setPhone("");
      setError("");
    }
  }, [open, keyword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required."); return; }
    if (!code.trim()) { setError("Code is required."); return; }
    if (!ledgerGroupId) { setError("Ledger group is required."); return; }
    setError("");

    try {
      const customer = await createCustomer({
        basicDetails: {
          code: code.trim(),
          name: name.trim(),
          alias: null,
          customerType,
          category: null,
        },
        ledgerGroupId,
        contact: {
          phone: phone.trim() || null,
          mobile: null,
          email: null,
          website: null,
        },
        billingAddress: {
          street: null,
          city: null,
          state: null,
          pincode: null,
          country: null,
        },
        shippingAddresses: [],
        taxDocuments: [],
        financials: { creditLimit: null, creditDays: null },
        salesAndPricing: { defaultTaxId: null, priceLevel: "RRATE" },
        statusDetails: { remarks: null },
        status: "Active",
        openingBalance: null,
      }).unwrap();

      onSuccess(customer);
    } catch {
      setError("Failed to create customer. Please try again.");
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} className="w-full max-w-md">
      <div className="p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white">
          Quick Add Customer
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>
              Name<span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer name"
              autoFocus
            />
          </div>

          <CodeInput
            entity="customer"
            label="Code"
            required
            value={code}
            onChange={setCode}
            placeholder="CUST-001"
          />

          <div>
            <label className={labelClass}>
              Ledger Group (Asset)<span className="text-red-500">*</span>
            </label>
            <AutocompleteSelect<LedgerGroup, { items: LedgerGroup[] }>
              value={ledgerGroupLabel}
              selectedKey={ledgerGroupId || null}
              placeholder="Search asset ledger group"
              search={(kw) =>
                searchGroups({ keyword: kw, nature: "Asset", limit: 10 })
              }
              getItems={(result) => result.items}
              getOptionKey={(item) => item.id}
              getOptionLabel={(item) => `${item.code} - ${item.name}`}
              onInputChange={(v) => {
                if (!v.trim()) {
                  setLedgerGroupId("");
                  setLedgerGroupLabel("");
                } else {
                  setLedgerGroupLabel(v);
                }
              }}
              onSelect={(item) => {
                setLedgerGroupId(item?.id ?? "");
                setLedgerGroupLabel(
                  item ? `${item.code} - ${item.name}` : "",
                );
              }}
            />
          </div>

          <div>
            <label className={labelClass}>Customer Type</label>
            <select
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value as CustomerType)}
              className={inputClass}
            >
              {CUSTOMER_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Phone</label>
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
            />
          </div>

          {error && <p className={errorClass}>{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
