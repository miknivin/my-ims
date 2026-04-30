import { FormEvent, useMemo, useState } from "react";
import {
  LedgerGroup,
  useGetLedgerGroupsQuery,
} from "../../../../../app/api/ledgerGroupApi";
import { Vendor, useCreateVendorMutation } from "../../../../../app/api/vendorApi";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import Label from "../../../../form/Label";
import Input from "../../../../form/input/InputField";
import Button from "../../../../ui/button/Button";

interface QuickCreateVendorFormProps {
  initialName?: string;
  onCreated: (vendor: Vendor) => void;
  onCancel: () => void;
}

function filterLedgerGroups(ledgerGroups: LedgerGroup[], keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  return ledgerGroups
    .filter((item) => {
      if (item.nature !== "Liability" || item.status !== "Active") {
        return false;
      }

      if (!normalizedKeyword) {
        return true;
      }

      return (
        item.code.toLowerCase().includes(normalizedKeyword) ||
        item.name.toLowerCase().includes(normalizedKeyword)
      );
    })
    .slice(0, 10);
}

export default function QuickCreateVendorForm({
  initialName = "",
  onCreated,
  onCancel,
}: QuickCreateVendorFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState(initialName);
  const [ledgerGroupId, setLedgerGroupId] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const { data: ledgerGroups = [] } = useGetLedgerGroupsQuery();
  const [createVendor, { isLoading }] = useCreateVendorMutation();

  const selectedLedgerGroupLabel = useMemo(() => {
    const selectedLedgerGroup = ledgerGroups.find((item) => item.id === ledgerGroupId);
    return selectedLedgerGroup
      ? `${selectedLedgerGroup.code} - ${selectedLedgerGroup.name}`
      : "";
  }, [ledgerGroupId, ledgerGroups]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (
      !code.trim() ||
      !name.trim() ||
      !ledgerGroupId ||
      !address.trim() ||
      !phone.trim() ||
      !email.trim()
    ) {
      setFormError("Code, name, ledger group, address, phone, and email are required.");
      return;
    }

    try {
      const vendor = await createVendor({
        basicInfo: {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          under: null,
        },
        addressAndContact: {
          contactName: null,
          nameInOl: null,
          address: address.trim(),
          phone: phone.trim(),
          mobile: null,
          email: email.trim(),
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
        taxAndCompliance: {
          gstin: null,
          tin: null,
        },
        ledgerGroupId,
        bankDetails: {
          bankDetails: null,
          accountNo: null,
          bankAddress: null,
        },
        other: {
          company: null,
        },
        status: "Active",
        openingBalance: null,
      }).unwrap();

      onCreated(vendor);
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to create vendor.";

      setFormError(message ?? "Failed to create vendor.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-5 dark:bg-gray-900 sm:p-6">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Quick Add Vendor
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create a vendor without leaving the current order or invoice.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>
            Vendor Code<span className="text-error-500">*</span>
          </Label>
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="VEND-001"
          />
        </div>
        <div>
          <Label>
            Vendor Name<span className="text-error-500">*</span>
          </Label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="ACME Supplies Pvt Ltd"
          />
        </div>
        <div className="md:col-span-2">
          <Label>
            Ledger Group<span className="text-error-500">*</span>
          </Label>
          <AutocompleteSelect<LedgerGroup, LedgerGroup[]>
            value={selectedLedgerGroupLabel}
            placeholder="Search liability ledger group"
            search={(keyword) => filterLedgerGroups(ledgerGroups, keyword)}
            getItems={(result) => result}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) => `${item.code} - ${item.name}`}
            onInputChange={(value) => {
              if (!value.trim()) {
                setLedgerGroupId("");
              }
            }}
            onSelect={(item) => setLedgerGroupId(item?.id ?? "")}
          />
        </div>
        <div className="md:col-span-2">
          <Label>
            Address<span className="text-error-500">*</span>
          </Label>
          <Input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="22 Market Road, Kochi, Kerala 682001"
          />
        </div>
        <div>
          <Label>
            Phone<span className="text-error-500">*</span>
          </Label>
          <Input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="9876543210"
          />
        </div>
        <div>
          <Label>
            Email<span className="text-error-500">*</span>
          </Label>
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="accounts@example.com"
          />
        </div>
      </div>

      {formError ? <p className="text-sm text-error-500">{formError}</p> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Vendor"}
        </Button>
      </div>
    </form>
  );
}
