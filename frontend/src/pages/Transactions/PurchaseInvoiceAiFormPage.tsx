import { useLocation } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PurchaseInvoiceForm from "../../components/page-components/transactions/purchase-invoice-ai/PurchaseInvoiceForm";
import { PurchaseInvoiceAiMappingResult } from "../../app/api/purchaseInvoiceAiApi";

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
