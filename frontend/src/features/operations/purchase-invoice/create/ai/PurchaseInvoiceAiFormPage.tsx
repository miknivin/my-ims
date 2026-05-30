import { useLocation } from "react-router";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import PurchaseInvoiceForm from "@/features/operations/purchase-invoice/create/ai/PurchaseInvoiceForm";
import { PurchaseInvoiceAiMappingResult } from "@/redux/api/purchaseInvoiceAiApi";

interface PurchaseInvoiceAiLocationState {
  aiMapping?: PurchaseInvoiceAiMappingResult;
}

export default function PurchaseInvoiceAiFormPage() {
  const location = useLocation();
  const aiMapping = (location.state as PurchaseInvoiceAiLocationState | null)
    ?.aiMapping;

  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Purchase Invoice with AI" />
      <PurchaseInvoiceForm key={location.key} aiMapping={aiMapping} />
    </div>
  );
}
