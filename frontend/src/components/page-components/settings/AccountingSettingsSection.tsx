import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import AutocompleteSelect from "../../form/AutocompleteSelect";
import { useSettingsForm } from "./SettingsFormContext";

type LedgerFieldProps = {
  label: string;
  value: string;
  helpText: string;
  onInputChange: (value: string) => void;
  onSelect: (item: { id: string; name: string } | null) => void;
  search: ReturnType<typeof useSettingsForm>["searchPostingLedgers"];
};

function LedgerField({
  label,
  value,
  helpText,
  onInputChange,
  onSelect,
  search,
}: LedgerFieldProps) {
  return (
    <div>
      <Label>{label}</Label>
      <AutocompleteSelect
        value={value}
        placeholder="Search ledger"
        search={search}
        getItems={(result) => result}
        getOptionKey={(item) => item.id}
        getOptionLabel={(item) => item.name}
        onInputChange={onInputChange}
        onSelect={onSelect}
      />
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {helpText}
      </p>
    </div>
  );
}

export default function AccountingSettingsSection() {
  const { state, setAccountingSettings, searchPostingLedgers } = useSettingsForm();

  const bindLedger = (
    idKey:
      | "discountAllowedLedgerId"
      | "discountReceivedLedgerId"
      | "inventoryLedgerId"
      | "salesLedgerId"
      | "costOfGoodsSoldLedgerId"
      | "grnClearingLedgerId"
      | "purchaseTaxLedgerId"
      | "salesTaxLedgerId"
      | "defaultCashLedgerId"
      | "grnAdditionLedgerId"
      | "grnDiscountLedgerId"
      | "roundOffLedgerId",
    nameKey:
      | "discountAllowedLedgerName"
      | "discountReceivedLedgerName"
      | "inventoryLedgerName"
      | "salesLedgerName"
      | "costOfGoodsSoldLedgerName"
      | "grnClearingLedgerName"
      | "purchaseTaxLedgerName"
      | "salesTaxLedgerName"
      | "defaultCashLedgerName"
      | "grnAdditionLedgerName"
      | "grnDiscountLedgerName"
      | "roundOffLedgerName"
  ) => ({
    value: state.accountingSettings[nameKey],
    onInputChange: (value: string) =>
      setAccountingSettings({
        [nameKey]: value,
      }),
    onSelect: (item: { id: string; name: string } | null) =>
      setAccountingSettings({
        [idKey]: item?.id ?? null,
        [nameKey]: item?.name ?? "",
      }),
  });

  return (
    <div className="space-y-6">
      <ComponentCard title="" className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Bill-Wise Discount Posting
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Configure the ledgers used when bill-wise receipt and payment
              discounts are auto-posted to journals.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <LedgerField
              label="Discount Allowed Ledger"
              helpText="Used as the debit ledger for discount given in bill-wise receipts."
              search={searchPostingLedgers}
              {...bindLedger("discountAllowedLedgerId", "discountAllowedLedgerName")}
            />
            <LedgerField
              label="Discount Received Ledger"
              helpText="Used as the credit ledger for discount received in bill-wise payments."
              search={searchPostingLedgers}
              {...bindLedger("discountReceivedLedgerId", "discountReceivedLedgerName")}
            />
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="" className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Invoice and Inventory Journals
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Configure the core ledgers used by sales invoice, purchase invoice,
              and stock-related journal posting.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <LedgerField
              label="Inventory Ledger"
              helpText="Used for stock value on GRN, purchase invoice, and sales COGS posting."
              search={searchPostingLedgers}
              {...bindLedger("inventoryLedgerId", "inventoryLedgerName")}
            />
            <LedgerField
              label="Sales Ledger"
              helpText="Used for taxable sales value on sales invoices."
              search={searchPostingLedgers}
              {...bindLedger("salesLedgerId", "salesLedgerName")}
            />
            <LedgerField
              label="COGS Ledger"
              helpText="Used for cost of goods sold on submitted sales invoices."
              search={searchPostingLedgers}
              {...bindLedger("costOfGoodsSoldLedgerId", "costOfGoodsSoldLedgerName")}
            />
            <LedgerField
              label="Default Cash Ledger"
              helpText="Used for immediate cash settlement on cash purchases and sales receipts on invoice."
              search={searchPostingLedgers}
              {...bindLedger("defaultCashLedgerId", "defaultCashLedgerName")}
            />
            <LedgerField
              label="Purchase Tax Ledger"
              helpText="Used as the single input-tax ledger for purchase invoices in v1."
              search={searchPostingLedgers}
              {...bindLedger("purchaseTaxLedgerId", "purchaseTaxLedgerName")}
            />
            <LedgerField
              label="Sales Tax Ledger"
              helpText="Used as the single output-tax ledger for sales invoices in v1."
              search={searchPostingLedgers}
              {...bindLedger("salesTaxLedgerId", "salesTaxLedgerName")}
            />
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="" className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              GRN Provisional Journals
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Configure the provisional ledgers used when GRNs are posted before
              the final purchase invoice arrives.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <LedgerField
              label="GRN Clearing Ledger"
              helpText="Used as the provisional liability/clearing ledger for submitted GRNs."
              search={searchPostingLedgers}
              {...bindLedger("grnClearingLedgerId", "grnClearingLedgerName")}
            />
            <LedgerField
              label="GRN Addition Ledger"
              helpText="Used for GRN footer additions until the purchase invoice finalizes the posting."
              search={searchPostingLedgers}
              {...bindLedger("grnAdditionLedgerId", "grnAdditionLedgerName")}
            />
            <LedgerField
              label="GRN Discount Ledger"
              helpText="Used for GRN footer discount posting until the purchase invoice clears it."
              search={searchPostingLedgers}
              {...bindLedger("grnDiscountLedgerId", "grnDiscountLedgerName")}
            />
            <LedgerField
              label="Round-Off Ledger"
              helpText="Used for GRN round-off debit or credit based on the sign of the amount."
              search={searchPostingLedgers}
              {...bindLedger("roundOffLedgerId", "roundOffLedgerName")}
            />
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
