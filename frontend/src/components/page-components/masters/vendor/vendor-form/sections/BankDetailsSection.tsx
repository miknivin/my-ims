import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { useVendorForm } from "../VendorFormContext";
import SectionCard from "../SectionCard";

export default function BankDetailsSection() {
  const { state, setBankDetails } = useVendorForm();

  return (
    <SectionCard title="Bank Details">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="mb-2 col-span-2 sm:col-span-1">
          <Label>Bank Details</Label>
          <Input
            value={state.bankDetails.bankDetails}
            onChange={(event) =>
              setBankDetails({ bankDetails: event.target.value })
            }
            placeholder="HDFC Bank"
          />
        </div>
        <div className="mb-2">
          <Label>Account No</Label>
          <Input
            value={state.bankDetails.accountNo}
            onChange={(event) =>
              setBankDetails({ accountNo: event.target.value })
            }
            placeholder="1234567890"
          />
        </div>
        <div className="mb-2 sm:col-span-2">
          <Label>Bank Address</Label>
          <Input
            value={state.bankDetails.bankAddress}
            onChange={(event) =>
              setBankDetails({ bankAddress: event.target.value })
            }
            placeholder="MG Road, Kochi"
          />
        </div>
      </div>
    </SectionCard>
  );
}
