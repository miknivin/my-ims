import { LookupOption } from "../../../../../types/filtering";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import TransactionHeaderGrid from "../../shared/TransactionHeaderGrid";
import TransactionSectionCard from "../../shared/TransactionSectionCard";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const areaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

interface BillWiseFormHeaderProps {
  documentLabel: string;
  voucherType: string;
  no: string;
  date: string;
  onNoChange: (value: string) => void;
  onDateChange: (value: string) => void;
  partyLabel: string;
  partyValue: string;
  partyAddress: string;
  partyAttention?: string;
  partyPhone?: string;
  onPartyInputChange: (value: string) => void;
  onPartySelect: (item: LookupOption | null) => void | Promise<void>;
  searchParty: (keyword: string) => Promise<LookupOption[]>;
  onPartyAddressChange: (value: string) => void;
  onPartyAttentionChange?: (value: string) => void;
  onPartyPhoneChange?: (value: string) => void;
  accountValue: string;
  onAccountInputChange: (value: string) => void;
  onAccountSelect: (item: LookupOption | null) => void;
  searchAccount: (keyword: string) => Promise<LookupOption[]>;
  referenceNo: string;
  instrumentNo: string;
  instrumentDate: string;
  notes: string;
  advance: string;
  totalAllocated: number;
  totalDiscount: number;
  amount: number;
  onReferenceNoChange: (value: string) => void;
  onInstrumentNoChange: (value: string) => void;
  onInstrumentDateChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onAdvanceChange: (value: string) => void;
}

export default function BillWiseFormHeader({
  documentLabel,
  voucherType,
  no,
  date,
  onNoChange,
  onDateChange,
  partyLabel,
  partyValue,
  partyAddress,
  partyAttention,
  partyPhone,
  onPartyInputChange,
  onPartySelect,
  searchParty,
  onPartyAddressChange,
  onPartyAttentionChange,
  onPartyPhoneChange,
  accountValue,
  onAccountInputChange,
  onAccountSelect,
  searchAccount,
  referenceNo,
  instrumentNo,
  instrumentDate,
  notes,
  advance,
  totalAllocated,
  totalDiscount,
  amount,
  onReferenceNoChange,
  onInstrumentNoChange,
  onInstrumentDateChange,
  onNotesChange,
  onAdvanceChange,
}: BillWiseFormHeaderProps) {
  return (
    <TransactionHeaderGrid>
      <TransactionSectionCard title="Document Details">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Voucher Type</label>
            <input className={inputClass} value={voucherType} readOnly />
          </div>

          <div>
            <label className={labelClass}>{documentLabel}</label>
            <input
              className={inputClass}
              value={no}
              onChange={(event) => onNoChange(event.target.value)}
              placeholder={`${voucherType}-0001`}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Date</label>
            <input
              type="date"
              className={inputClass}
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
            />
          </div>
        </div>
      </TransactionSectionCard>

      <TransactionSectionCard title={`${partyLabel} Details`}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>{partyLabel}</label>
            <AutocompleteSelect
              value={partyValue}
              className="bg-transparent"
              placeholder={`Search ${partyLabel.toLowerCase()}`}
              search={searchParty}
              getItems={(result) => result}
              getOptionKey={(item) => item.id}
              getOptionLabel={(item) => item.label}
              onInputChange={onPartyInputChange}
              onSelect={onPartySelect}
            />
          </div>

          {typeof partyAttention === "string" && onPartyAttentionChange ? (
            <div>
              <label className={labelClass}>Attention</label>
              <input
                className={inputClass}
                value={partyAttention}
                onChange={(event) => onPartyAttentionChange(event.target.value)}
                placeholder="Contact person"
              />
            </div>
          ) : null}

          {typeof partyPhone === "string" && onPartyPhoneChange ? (
            <div>
              <label className={labelClass}>Phone</label>
              <input
                className={inputClass}
                value={partyPhone}
                onChange={(event) => onPartyPhoneChange(event.target.value)}
                placeholder="Phone"
              />
            </div>
          ) : null}

          <div className="md:col-span-2">
            <label className={labelClass}>Address</label>
            <textarea
              rows={3}
              className={areaClass}
              value={partyAddress}
              onChange={(event) => onPartyAddressChange(event.target.value)}
              placeholder={`${partyLabel} address`}
            />
          </div>
        </div>
      </TransactionSectionCard>

      <TransactionSectionCard title="Payment Details">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>Account Ledger</label>
            <AutocompleteSelect
              value={accountValue}
              className="bg-transparent"
              placeholder="Search ledger"
              search={searchAccount}
              getItems={(result) => result}
              getOptionKey={(item) => item.id}
              getOptionLabel={(item) => item.label}
              onInputChange={onAccountInputChange}
              onSelect={onAccountSelect}
            />
          </div>

          <div>
            <label className={labelClass}>Reference No</label>
            <input
              className={inputClass}
              value={referenceNo}
              onChange={(event) => onReferenceNoChange(event.target.value)}
              placeholder="Reference number"
            />
          </div>

          <div>
            <label className={labelClass}>Instrument No</label>
            <input
              className={inputClass}
              value={instrumentNo}
              onChange={(event) => onInstrumentNoChange(event.target.value)}
              placeholder="Instrument / cheque no"
            />
          </div>

          <div>
            <label className={labelClass}>Instrument Date</label>
            <input
              type="date"
              className={inputClass}
              value={instrumentDate}
              onChange={(event) => onInstrumentDateChange(event.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Advance</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={advance}
              onChange={(event) => onAdvanceChange(event.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className={labelClass}>Total Allocated</label>
            <input
              className={inputClass}
              value={totalAllocated.toFixed(2)}
              readOnly
            />
          </div>

          <div>
            <label className={labelClass}>Total Discount</label>
            <input
              className={inputClass}
              value={totalDiscount.toFixed(2)}
              readOnly
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Amount</label>
            <input className={inputClass} value={amount.toFixed(2)} readOnly />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Notes</label>
            <textarea
              rows={4}
              className={areaClass}
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              placeholder="Notes"
            />
          </div>
        </div>
      </TransactionSectionCard>
    </TransactionHeaderGrid>
  );
}
