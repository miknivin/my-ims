import { useGetCurrenciesQuery } from "../../../../../../app/api/currencyApi";
import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import TextArea from "../../../../../form/input/TextArea";
import { useVendorForm } from "../VendorFormContext";
import SectionCard from "../SectionCard";

export default function CreditAndFinanceSection() {
  const { state, setCreditAndFinance } = useVendorForm();
  const { data: currencies = [] } = useGetCurrenciesQuery();

  return (
    <SectionCard title="Credit & Finance">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="mb-2">
          <Label>Credit Limit</Label>
          <Input
            value={state.creditAndFinance.creditLimit}
            onChange={(event) => setCreditAndFinance({ creditLimit: event.target.value })}
            placeholder="50000"
            type="number"
          />
        </div>
        <div className="mb-2">
          <Label>Due Days</Label>
          <Input
            value={state.creditAndFinance.dueDays}
            onChange={(event) => setCreditAndFinance({ dueDays: event.target.value })}
            placeholder="30"
            type="number"
          />
        </div>
        <div className="mb-2">
          <Label>Currency</Label>
          <select
            value={state.creditAndFinance.currencyId}
            onChange={(event) => setCreditAndFinance({ currencyId: event.target.value })}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="">Select a currency</option>
            {currencies.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code} - {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <Label>Payment Terms</Label>
          <Input
            value={state.creditAndFinance.paymentTerms}
            onChange={(event) => setCreditAndFinance({ paymentTerms: event.target.value })}
            placeholder="30 days credit"
          />
        </div>
        <div className="mb-2 sm:col-span-2">
          <Label>Remark</Label>
          <TextArea
            value={state.creditAndFinance.remark}
            onChange={(value) => setCreditAndFinance({ remark: value })}
            rows={3}
          />
        </div>
      </div>
    </SectionCard>
  );
}
