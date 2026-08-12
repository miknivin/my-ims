import { useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle, Download, Loader2, Pencil, XCircle } from "lucide-react";
import {
  DeliveryNoteListItem,
  useDownloadDeliveryNotePdfMutation,
  useUpdateDeliveryNoteStatusMutation,
} from "@/redux/api/deliveryNoteApi";
import ConfirmAlert from "@/shared/components/ui/alert/ConfirmAlert";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

interface DeliveryNoteTableProps {
  deliveryNotes: DeliveryNoteListItem[];
  isLoading: boolean;
  isError: boolean;
}

function formatDate(value: string, includeTime = false) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function statusBadgeClass(status: string) {
  if (status === "Draft")
    return "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400";
  if (status === "Submitted")
    return "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400";
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

export default function DeliveryNoteTable({
  deliveryNotes,
  isLoading,
  isError,
}: DeliveryNoteTableProps) {
  const navigate = useNavigate();
  const [downloadPdf] = useDownloadDeliveryNotePdfMutation();
  const [updateStatus] = useUpdateDeliveryNoteStatusMutation();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    id: string;
    no: string;
    type: "submit" | "cancel";
  } | null>(null);

  const handleDownload = async (dn: DeliveryNoteListItem) => {
    setDownloadingId(dn.id);
    try {
      const url = await downloadPdf(dn.id).unwrap();
      const a = document.createElement("a");
      a.href = url;
      a.download = `DN-${dn.no}.pdf`;
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
        status: confirm.type === "submit" ? "Submitted" : "Cancelled",
      }).unwrap();
    } finally {
      setActionId(null);
      setConfirm(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">
        Loading delivery notes...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error loading delivery notes.
      </div>
    );
  }

  return (
    <>
      <ConfirmAlert
        open={!!confirm}
        title={confirm?.type === "submit" ? `Submit DN ${confirm?.no}?` : `Cancel DN ${confirm?.no}?`}
        message={
          confirm?.type === "submit"
            ? "This will mark the delivery note as Submitted."
            : "This will cancel the delivery note. This cannot be undone."
        }
        confirmLabel={confirm?.type === "submit" ? "Submit" : "Cancel DN"}
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
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">DN No</TableCell>
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
                {deliveryNotes.map((dn) => (
                  <TableRow key={dn.id}>
                    <TableCell className="px-5 py-4 text-start text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      {dn.no}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {formatDate(dn.date)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {dn.customerName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {dn.netTotal.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(dn.status)}`}>
                        {dn.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {formatDate(dn.createdAtUtc, true)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {formatDate(dn.updatedAtUtc, true)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Download PDF"
                          disabled={downloadingId === dn.id}
                          onClick={() => void handleDownload(dn)}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                        >
                          {downloadingId === dn.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Download size={14} />
                          )}
                        </button>

                        {dn.status === "Draft" ? (
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => navigate(`/operations/delivery-note/${dn.id}/edit`)}
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                          >
                            <Pencil size={14} />
                          </button>
                        ) : null}

                        {dn.status === "Draft" ? (
                          <button
                            type="button"
                            title="Submit"
                            disabled={actionId === dn.id}
                            onClick={() => setConfirm({ id: dn.id, no: dn.no, type: "submit" })}
                            className="rounded-lg border border-green-200 p-2 text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10"
                          >
                            {actionId === dn.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                          </button>
                        ) : null}

                        {dn.status !== "Cancelled" ? (
                          <button
                            type="button"
                            title="Cancel"
                            disabled={actionId === dn.id}
                            onClick={() => setConfirm({ id: dn.id, no: dn.no, type: "cancel" })}
                            className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                          >
                            {actionId === dn.id ? (
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

        {deliveryNotes.length === 0 ? (
          <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
            No delivery notes yet. Use "Add +" to create the first one.
          </div>
        ) : null}
      </div>
    </>
  );
}
