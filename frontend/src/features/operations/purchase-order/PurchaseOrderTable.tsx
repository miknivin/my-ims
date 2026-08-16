import { useState } from "react";
import { useNavigate } from "react-router";
import { useFmtDate } from "@/shared/hooks/useFmtDate";
import { Download, Eye, Pencil } from "lucide-react";
import { PurchaseOrderListItem, useDownloadPurchaseOrderPdfMutation } from "@/redux/api/purchaseOrderApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

interface PurchaseOrderTableProps {
  purchaseOrders: PurchaseOrderListItem[];
  isLoading: boolean;
  isError: boolean;
}

export default function PurchaseOrderTable({
  purchaseOrders,
  isLoading,
  isError,
}: PurchaseOrderTableProps) {
  const fmtDate = useFmtDate();
  const navigate = useNavigate();
  const [downloadPdf] = useDownloadPurchaseOrderPdfMutation();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (id: string, no: string) => {
    setDownloadingId(id);
    try {
      const url = await downloadPdf(id).unwrap();
      const a = document.createElement("a");
      a.href = url;
      a.download = `PO-${no}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  };
  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">
        Loading purchase orders...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error loading purchase orders.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[980px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  PO No
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Date
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Vendor
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Net Total
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Created
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Updated
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {purchaseOrders.map((purchaseOrder) => (
                <TableRow key={purchaseOrder.id}>
                  <TableCell className="px-5 py-4 text-start text-theme-sm font-medium text-gray-800 dark:text-white/90">
                    {purchaseOrder.no}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {fmtDate(purchaseOrder.date)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {purchaseOrder.vendorName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {purchaseOrder.netTotal.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        purchaseOrder.status === "Draft"
                          ? "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400"
                          : purchaseOrder.status === "Submitted"
                            ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400"
                            : "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400"
                      }`}
                    >
                      {purchaseOrder.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {fmtDate(purchaseOrder.createdAtUtc, true)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {fmtDate(purchaseOrder.updatedAtUtc, true)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="View"
                        onClick={() => navigate(`/operations/purchase-order/${purchaseOrder.id}`)}
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(purchaseOrder.id, purchaseOrder.no)}
                        disabled={downloadingId === purchaseOrder.id}
                        aria-label="Download PDF"
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                      >
                        <Download size={14} />
                      </button>
                      {purchaseOrder.status !== "Cancelled" ? (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/operations/purchase-order/${purchaseOrder.id}/edit`,
                            )
                          }
                          aria-label="Edit"
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                        >
                          <Pencil size={14} />
                        </button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {purchaseOrders.length === 0 ? (
        <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
          No purchase orders yet. Use "Add +" to create the first one.
        </div>
      ) : null}
    </div>
  );
}
