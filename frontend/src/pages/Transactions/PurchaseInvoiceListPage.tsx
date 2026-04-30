import { ChangeEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useGetPurchaseInvoicesQuery } from "../../app/api/purchaseInvoiceApi";
import { useMapPurchaseInvoiceWithAiMutation } from "../../app/api/purchaseInvoiceAiApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import PurchaseInvoiceTable from "../../components/tables/PurchaseInvoiceTable";
import { Modal } from "../../components/ui/modal";

function getMutationErrorMessage(error: unknown) {
  const fetchError = error as FetchBaseQueryError | undefined;

  if (fetchError && "status" in fetchError) {
    const errorData = fetchError.data as { message?: string } | undefined;
    return errorData?.message ?? "Unable to map the purchase invoice with AI.";
  }

  return "Unable to map the purchase invoice with AI.";
}

export default function PurchaseInvoiceListPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useGetPurchaseInvoicesQuery();
  const [mapPurchaseInvoiceWithAi] = useMapPurchaseInvoiceWithAiMutation();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiError, setAiError] = useState("");
  const [isMapping, setIsMapping] = useState(false);

  const purchaseInvoices = data;
  const selectedFileLabel = useMemo(
    () => selectedFile?.name ?? "Choose a PDF to continue",
    [selectedFile],
  );

  const handleAiFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setAiError("");
  };

  const handleCloseAiModal = () => {
    if (isMapping) {
      return;
    }

    setIsAiModalOpen(false);
    setSelectedFile(null);
    setAiError("");
  };

  const handleAiSubmit = async () => {
    if (!selectedFile) {
      setAiError("Please choose a purchase invoice PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsMapping(true);
    setAiError("");

    try {
      const aiMapping = await mapPurchaseInvoiceWithAi(formData).unwrap();
      setIsAiModalOpen(false);
      setSelectedFile(null);
      navigate("/operations/purchase-invoice/new-ai", {
        state: { aiMapping },
      });
    } catch (error) {
      setAiError(getMutationErrorMessage(error));
    } finally {
      setIsMapping(false);
    }
  };

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Purchase Invoice" />

      <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center">
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => navigate("/operations/purchase-invoice/new")}
        >
          Add +
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setIsAiModalOpen(true)}
        >
          Add with AI
        </Button>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Purchase Invoices" desc="">
          <PurchaseInvoiceTable
            purchaseInvoices={purchaseInvoices}
            isLoading={isLoading}
            isError={isError}
          />
        </ComponentCard>
      </div>

      <Modal
        isOpen={isAiModalOpen}
        onClose={handleCloseAiModal}
        className="max-w-2xl p-6"
      >
        <div className="space-y-6 p-2 sm:p-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Add Purchase Invoice with AI
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload a purchase invoice PDF.
            </p>
          </div>

          <label className="block cursor-pointer rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10">
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleAiFileChange}
              disabled={isMapping}
            />
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                {selectedFileLabel}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                PDF only, up to 10 MB
              </div>
            </div>
          </label>

          {aiError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {aiError}
            </div>
          ) : null}

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseAiModal}
              disabled={isMapping}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleAiSubmit} disabled={isMapping}>
              {isMapping ? "Mapping..." : "Upload & Analyze"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
