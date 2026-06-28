import { Currency, useGetCurrenciesQuery } from "@/redux/api/currencyApi";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import Label from "@/shared/components/form/Label";
import Input from "@/shared/components/form/input/InputField";
import TextArea from "@/shared/components/form/input/TextArea";
import { useVendorForm } from "../VendorFormContext";
import SectionCard from "../SectionCard";

export default function CreditAndFinanceSection() {
  const { state, setCreditAndFinance } = useVendorForm();
  const { data: currencies = [] } = useGetCurrenciesQuery();
  const selectedCurrency = currencies.find(
    (c) => c.id === state.creditAndFinance.currencyId,
  );
  const selectedCurrencyLabel = selectedCurrency
    ? `${selectedCurrency.code} - ${selectedCurrency.name}`
    : "";

  return (
    <SectionCard title="Credit & Finance">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="mb-2">
          <Label>Credit Limit</Label>
          <Input
            value={state.creditAndFinance.creditLimit}
            onChange={(event) =>
              setCreditAndFinance({ creditLimit: event.target.value })
            }
            placeholder="50000"
            type="number"
          />
        </div>
        <div className="mb-2">
          <Label>Due Days</Label>
          <Input
            value={state.creditAndFinance.dueDays}
            onChange={(event) =>
              setCreditAndFinance({ dueDays: event.target.value })
            }
            placeholder="30"
            type="number"
          />
        </div>
        <div className="mb-2 sm:col-span-2">
          <Label>Currency</Label>
          <AutocompleteSelect<Currency, Currency[]>
            value={selectedCurrencyLabel}
            placeholder="Search currency"
            search={(keyword) =>
              currencies.filter(
                (c) =>
                  c.code.toLowerCase().includes(keyword.toLowerCase()) ||
                  c.name.toLowerCase().includes(keyword.toLowerCase()),
              )
            }
            getItems={(result) => result}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) => `${item.code} - ${item.name}`}
            onInputChange={(value) => {
              if (!value.trim()) setCreditAndFinance({ currencyId: "" });
            }}
            onSelect={(item) =>
              setCreditAndFinance({ currencyId: item?.id ?? "" })
            }
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
