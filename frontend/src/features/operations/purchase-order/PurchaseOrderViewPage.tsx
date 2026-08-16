import { useState } from "react";
import { useParams } from "react-router";
import { useGetPurchaseOrderByIdQuery, useDownloadPurchaseOrderPdfMutation } from "@/redux/api/purchaseOrderApi";
import { useFmtDate } from "@/shared/hooks/useFmtDate";
import { ViewPageShell, ViewSection, ViewGrid, ViewField, StatusBadge, ViewTable, TH, TH_R, TD, TD_R, fmt } from "@/shared/components/view/TransactionView";
import Button from "@/shared/components/ui/button/Button";
import { Download, Loader2 } from "lucide-react";

export default function PurchaseOrderViewPage() {
  const { id } = useParams<{ id: string }>();
  const fmtDate = useFmtDate();
  const { data, isLoading, isError } = useGetPurchaseOrderByIdQuery(id ?? "", { skip: !id });
  const [downloadPdf] = useDownloadPurchaseOrderPdfMutation();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const url = await downloadPdf(data.id).unwrap();
      const a = document.createElement("a");
      a.href = url;
      a.download = `PO-${data.orderDetails.no}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ViewPageShell
      title="Purchase Order"
      backPath="/operations/purchase-order"
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
          <ViewSection title="Order Details">
            <ViewGrid>
              <ViewField label="PO No" value={data.orderDetails.no} strong />
              <ViewField label="Date" value={fmtDate(data.orderDetails.date)} />
              <ViewField label="Due Date" value={fmtDate(data.orderDetails.dueDate)} />
              <ViewField label="Delivery Date" value={fmtDate(data.orderDetails.deliveryDate)} />
            </ViewGrid>
            <div className="mt-3"><StatusBadge status={data.status} /></div>
          </ViewSection>

          <ViewSection title="Vendor">
            <ViewGrid>
              <ViewField label="Vendor" value={data.vendorInformation.vendorNameSnapshot} strong />
              <ViewField label="Address" value={data.vendorInformation.address} />
              <ViewField label="Attention" value={data.vendorInformation.attention} />
              <ViewField label="Phone" value={data.vendorInformation.phone} />
            </ViewGrid>
          </ViewSection>

          <ViewSection title="Financial Details">
            <ViewGrid>
              <ViewField label="Payment Mode" value={data.financialDetails.paymentMode} />
              <ViewField label="Credit Limit" value={fmt(data.financialDetails.creditLimit)} />
              <ViewField label="Currency" value={data.financialDetails.currencyLabelSnapshot} />
              <ViewField label="Balance" value={fmt(data.financialDetails.balance)} />
            </ViewGrid>
          </ViewSection>

          <ViewSection title="Delivery Information">
            <ViewGrid>
              <ViewField label="Warehouse" value={data.deliveryInformation.warehouseNameSnapshot} />
              <ViewField label="Address" value={data.deliveryInformation.address} />
              <ViewField label="Attention" value={data.deliveryInformation.attention} />
              <ViewField label="Phone" value={data.deliveryInformation.phone} />
            </ViewGrid>
          </ViewSection>

          {(data.productInformation.reference || data.productInformation.mrNo) && (
            <ViewSection title="References">
              <ViewGrid>
                <ViewField label="Reference" value={data.productInformation.reference} />
                <ViewField label="MR No" value={data.productInformation.mrNo} />
              </ViewGrid>
            </ViewSection>
          )}

          <ViewSection title="Line Items" className="col-span-full">
            <ViewTable>
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className={TH}>Item</th>
                  <th className={TH}>HSN</th>
                  <th className={TH}>Unit</th>
                  <th className={TH}>Warehouse</th>
                  <th className={TH_R}>Qty</th>
                  <th className={TH_R}>Rcvd</th>
                  <th className={TH_R}>Rate</th>
                  <th className={TH_R}>Gross</th>
                  <th className={TH_R}>Disc</th>
                  <th className={TH_R}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 min-w-[160px]">{item.itemNameSnapshot}</td>
                    <td className={TD}>{item.hsnCode ?? "—"}</td>
                    <td className={TD}>{item.unitName}</td>
                    <td className={TD}>{item.warehouseName ?? "—"}</td>
                    <td className={TD_R}>{item.quantity}</td>
                    <td className={TD_R}>{item.receivedQty}</td>
                    <td className={TD_R}>{fmt(item.rate)}</td>
                    <td className={TD_R}>{fmt(item.grossAmount)}</td>
                    <td className={TD_R}>{fmt(item.discountAmount)}</td>
                    <td className={`${TD_R} font-semibold`}>{fmt(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </ViewTable>
          </ViewSection>

          {data.additions.length > 0 && (
            <ViewSection title="Additions / Deductions" className="col-span-full">
              <ViewTable>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className={TH}>Type</th>
                    <th className={TH}>Ledger</th>
                    <th className={TH}>Description</th>
                    <th className={TH_R}>Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data.additions.map((a) => (
                    <tr key={a.id}>
                      <td className={TD}>{a.type}</td>
                      <td className={TD}>{a.ledgerNameSnapshot}</td>
                      <td className={TD}>{a.description ?? "—"}</td>
                      <td className={TD_R}>{fmt(a.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </ViewTable>
            </ViewSection>
          )}

          <ViewSection title="Summary" className="col-span-full">
            <div className="flex justify-end">
              <dl className="w-full max-w-xs space-y-1.5">
                <SummaryRow label="Total" value={fmt(data.footer.total)} />
                <SummaryRow label="Discount" value={fmt(data.footer.discount)} />
                <SummaryRow label="Tax" value={fmt(data.footer.tax)} />
                <SummaryRow label="Addition" value={fmt(data.footer.addition)} />
                <SummaryRow label="Net Total" value={fmt(data.footer.netTotal)} bold />
              </dl>
            </div>
            {data.footer.notes && (
              <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                <p className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Notes</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{data.footer.notes}</p>
              </div>
            )}
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
