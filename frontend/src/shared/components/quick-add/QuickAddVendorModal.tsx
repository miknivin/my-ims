import { useEffect, useState } from "react";
import { LedgerGroup, useLazyGetLedgerGroupsQuery } from "@/redux/api/ledgerGroupApi";
import { Vendor, useCreateVendorMutation } from "@/redux/api/vendorApi";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import CodeInput from "@/shared/components/form/CodeInput";
import { Modal } from "@/shared/components/ui/modal";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";
const errorClass = "text-sm text-red-500 dark:text-red-400";

interface Props {
  open: boolean;
  keyword: string;
  onClose: () => void;
  onSuccess: (vendor: Vendor) => void;
}

export default function QuickAddVendorModal({ open, keyword, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [ledgerGroupId, setLedgerGroupId] = useState("");
  const [ledgerGroupLabel, setLedgerGroupLabel] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const [createVendor, { isLoading }] = useCreateVendorMutation();
  const [searchGroups] = useLazyGetLedgerGroupsQuery();

  useEffect(() => {
    if (open) {
      setName(keyword);
      setCode("");
      setLedgerGroupId("");
      setLedgerGroupLabel("");
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
      const vendor = await createVendor({
        basicInfo: { code: code.trim(), name: name.trim(), under: null },
        addressAndContact: {
          contactName: null,
          nameInOl: null,
          address: "",
          phone: phone.trim(),
          mobile: null,
          email: "",
          web: null,
          fax: null,
        },
        creditAndFinance: {
          creditLimit: null,
          dueDays: null,
          currencyId: null,
          paymentTerms: null,
          remark: null,
        },
        taxAndCompliance: { gstin: null, tin: null },
        ledgerGroupId,
        bankDetails: { bankDetails: null, accountNo: null, bankAddress: null },
        other: { company: null },
        status: "Active",
        openingBalance: null,
      }).unwrap();

      onSuccess(vendor);
    } catch {
      setError("Failed to create vendor. Please try again.");
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} className="w-full max-w-md">
      <div className="p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white">
          Quick Add Vendor
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
              placeholder="Vendor name"
              autoFocus
            />
          </div>

          <CodeInput
            entity="vendor"
            label="Code"
            required
            value={code}
            onChange={setCode}
            placeholder="VEND-001"
          />

          <div>
            <label className={labelClass}>
              Ledger Group (Liability)<span className="text-red-500">*</span>
            </label>
            <AutocompleteSelect<LedgerGroup, { items: LedgerGroup[] }>
              value={ledgerGroupLabel}
              selectedKey={ledgerGroupId || null}
              placeholder="Search liability ledger group"
              search={(kw) =>
                searchGroups({ keyword: kw, nature: "Liability", limit: 10 })
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
              {isLoading ? "Creating..." : "Create Vendor"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
