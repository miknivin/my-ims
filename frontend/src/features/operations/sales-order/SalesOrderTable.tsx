import { useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle, Download, Eye, Loader2, Pencil, XCircle } from "lucide-react";
import { useFmtDate } from "@/shared/hooks/useFmtDate";
import {
  SalesOrderListItem,
  useDownloadSalesOrderPdfMutation,
  useUpdateSalesOrderStatusMutation,
} from "@/redux/api/salesOrderApi";
import ConfirmAlert from "@/shared/components/ui/alert/ConfirmAlert";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

interface SalesOrderTableProps {
  salesOrders: SalesOrderListItem[];
  isLoading: boolean;
  isError: boolean;
}

export default function SalesOrderTable({
  salesOrders,
  isLoading,
  isError,
}: SalesOrderTableProps) {
  const fmtDate = useFmtDate();
  const navigate = useNavigate();
  const [downloadPdf] = useDownloadSalesOrderPdfMutation();
  const [updateStatus] = useUpdateSalesOrderStatusMutation();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    id: string;
    no: string;
    type: "confirm" | "cancel";
  } | null>(null);

  const handleDownload = async (id: string, no: string) => {
    setDownloadingId(id);
    try {
      const url = await downloadPdf(id).unwrap();
      const a = document.createElement("a");
      a.href = url;
      a.download = `SO-${no}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    setActionId(confirm.id);
    try {
      await updateStatus({
        id: confirm.id,
        status: confirm.type === "confirm" ? "Confirmed" : "Cancelled",
      }).unwrap();
    } finally {
      setActionId(null);
      setConfirm(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">
        Loading sales orders...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error loading sales orders.
      </div>
    );
  }

  return (
    <>
      <ConfirmAlert
        open={!!confirm}
        title={
          confirm?.type === "confirm"
            ? `Confirm SO ${confirm?.no}?`
            : `Cancel SO ${confirm?.no}?`
        }
        message={
          confirm?.type === "confirm"
            ? "This will mark the sales order as Confirmed."
            : "This will cancel the sales order. This cannot be undone."
        }
        confirmLabel={confirm?.type === "confirm" ? "Confirm" : "Cancel Order"}
        isConfirming={!!actionId}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1080px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">SO No</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Date</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Customer</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Net Total</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Created</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Updated</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {salesOrders.map((so) => (
                  <TableRow key={so.id}>
                    <TableCell className="px-5 py-4 text-start text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      {so.no}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {fmtDate(so.date)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {so.customerName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {so.netTotal.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          so.status === "Draft"
                            ? "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400"
                            : so.status === "Confirmed" || so.status === "Delivered" || so.status === "Invoiced"
                              ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {so.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {fmtDate(so.createdAtUtc, true)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {fmtDate(so.updatedAtUtc, true)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="View"
                          onClick={() => navigate(`/operations/sales-order/${so.id}`)}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          title="Download PDF"
                          disabled={downloadingId === so.id}
                          onClick={() => handleDownload(so.id, so.no)}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                        >
                          {downloadingId === so.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Download size={14} />
                          )}
                        </button>

                        {(so.status === "Draft" || so.status === "Confirmed") ? (
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => navigate(`/operations/sales-order/${so.id}/edit`)}
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                          >
                            <Pencil size={14} />
                          </button>
                        ) : null}

                        {so.status === "Draft" ? (
                          <button
                            type="button"
                            title="Confirm"
                            disabled={actionId === so.id}
                            onClick={() => setConfirm({ id: so.id, no: so.no, type: "confirm" })}
                            className="rounded-lg border border-green-200 p-2 text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10"
                          >
                            {actionId === so.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                          </button>
                        ) : null}

                        {so.status === "Confirmed" ? (
                          <button
                            type="button"
                            title="Cancel Order"
                            disabled={actionId === so.id}
                            onClick={() => setConfirm({ id: so.id, no: so.no, type: "cancel" })}
                            className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                          >
                            {actionId === so.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <XCircle size={14} />
                            )}
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

        {salesOrders.length === 0 ? (
          <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
            No sales orders yet. Use "Add +" to create the first one.
          </div>
        ) : null}
      </div>
    </>
  );
}
