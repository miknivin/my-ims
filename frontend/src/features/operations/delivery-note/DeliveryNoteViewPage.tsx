import { useState } from "react";
import { useParams } from "react-router";
import { useGetDeliveryNoteByIdQuery, useDownloadDeliveryNotePdfMutation } from "@/redux/api/deliveryNoteApi";
import { useFmtDate } from "@/shared/hooks/useFmtDate";
import { ViewPageShell, ViewSection, ViewGrid, ViewField, StatusBadge, ViewTable, TH, TH_R, TD, TD_R, fmt } from "@/shared/components/view/TransactionView";
import Button from "@/shared/components/ui/button/Button";
import { Download, Loader2 } from "lucide-react";

export default function DeliveryNoteViewPage() {
  const { id } = useParams<{ id: string }>();
  const fmtDate = useFmtDate();
  const { data, isLoading, isError } = useGetDeliveryNoteByIdQuery(id ?? "", { skip: !id });
  const [downloadPdf] = useDownloadDeliveryNotePdfMutation();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const url = await downloadPdf(data.id).unwrap();
      const a = document.createElement("a");
      a.href = url;
      a.download = `DN-${data.document.no}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ViewPageShell
      title="Delivery Note"
      backPath="/operations/delivery-note"
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data}
      actions={
        data && (
          <Button type="button" variant="outline" onClick={handleDownload} disabled={downloading}>
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span>PDF</span>
          </Button>
        )
      }
    >
      {data && (
        <>
          <ViewSection title="Document">
            <ViewGrid>
              <ViewField label="DN No" value={data.document.no} strong />
              <ViewField label="Date" value={fmtDate(data.document.date)} />
              <ViewField label="Expected Delivery" value={data.document.expectedDeliveryDate ? fmtDate(data.document.expectedDeliveryDate) : undefined} />
              <ViewField label="Mode" value={data.sourceRef.mode} />
              {data.sourceRef.salesOrderNo && <ViewField label="SO No" value={data.sourceRef.salesOrderNo} />}
              {data.sourceRef.directRefNo && <ViewField label="Direct Ref No" value={data.sourceRef.directRefNo} />}
            </ViewGrid>
            <div className="mt-3"><StatusBadge status={data.status} /></div>
          </ViewSection>

          <ViewSection title="Customer">
            <ViewGrid>
              <ViewField label="Customer" value={data.customerInformation.customerNameSnapshot} strong />
              <ViewField label="Billing Address" value={data.customerInformation.address} />
              <ViewField label="Shipping Address" value={data.customerInformation.shippingAddress} />
              <ViewField label="Attention" value={data.customerInformation.attention} />
              <ViewField label="Phone" value={data.customerInformation.phone} />
            </ViewGrid>
          </ViewSection>

          <ViewSection title="Logistics">
            <ViewGrid>
              <ViewField label="Transport Mode" value={data.logistics.transportMode} />
              <ViewField label="Transporter" value={data.logistics.transporterName} />
              <ViewField label="Vehicle No" value={data.logistics.vehicleNo} />
              <ViewField label="LR No" value={data.logistics.lrNo} />
              <ViewField label="LR Date" value={data.logistics.lrDate ? fmtDate(data.logistics.lrDate) : undefined} />
              <ViewField label="E-Way Bill No" value={data.logistics.eWayBillNo} />
            </ViewGrid>
          </ViewSection>

          {data.general.notes && (
            <ViewSection title="Notes">
              <p className="text-sm text-gray-700 dark:text-gray-300">{data.general.notes}</p>
            </ViewSection>
          )}

          <ViewSection title="Line Items" className="col-span-full">
            <ViewTable>
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className={TH}>#</th>
                  <th className={TH}>Item</th>
                  <th className={TH}>HSN</th>
                  <th className={TH}>Unit</th>
                  <th className={TH}>Warehouse</th>
                  <th className={TH_R}>Qty</th>
                  <th className={TH_R}>Rate</th>
                  <th className={TH_R}>Gross</th>
                  <th className={TH_R}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className={TD}>{item.serialNo}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 min-w-[160px]">{item.productNameSnapshot}</td>
                    <td className={TD}>{item.hsnCode ?? "—"}</td>
                    <td className={TD}>{item.unitName}</td>
                    <td className={TD}>{item.warehouseName ?? "—"}</td>
                    <td className={TD_R}>{item.quantity}</td>
                    <td className={TD_R}>{fmt(item.rate)}</td>
                    <td className={TD_R}>{fmt(item.grossAmount)}</td>
                    <td className={`${TD_R} font-semibold`}>{fmt(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </ViewTable>
          </ViewSection>

          <ViewSection title="Summary" className="col-span-full">
            <div className="flex justify-end">
              <dl className="w-full max-w-xs space-y-1.5">
                <SummaryRow label="Total Qty" value={String(data.footer.totalQty)} />
                <SummaryRow label="Total Amount" value={fmt(data.footer.totalAmount)} />
                <SummaryRow label="Net Total" value={fmt(data.footer.netTotal)} bold />
              </dl>
            </div>
          </ViewSection>

          <ViewSection title="Timestamps" className="col-span-full">
            <ViewGrid>
              <ViewField label="Created" value={fmtDate(data.createdAtUtc, true)} />
              <ViewField label="Last Updated" value={fmtDate(data.updatedAtUtc, true)} />
            </ViewGrid>
          </ViewSection>
        </>
      )}
    </ViewPageShell>
  );
}

function SummaryRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? "border-t border-gray-200 pt-1.5 font-semibold text-gray-900 dark:border-gray-700 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
