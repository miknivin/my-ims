import { useParams } from "react-router";
import { useGetBillWiseReceiptByIdQuery } from "@/redux/api/billWiseReceiptApi";
import { useFmtDate } from "@/shared/hooks/useFmtDate";
import { ViewPageShell, ViewSection, ViewGrid, ViewField, StatusBadge, ViewTable, TH, TH_R, TD, TD_R, fmt } from "@/shared/components/view/TransactionView";

export default function BillWiseReceiptViewPage() {
  const { id } = useParams<{ id: string }>();
  const fmtDate = useFmtDate();
  const { data, isLoading, isError } = useGetBillWiseReceiptByIdQuery(id ?? "", { skip: !id });

  return (
    <ViewPageShell
      title="Customer Receipt"
      backPath="/operations/customer-receipts"
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data}
    >
      {data && (
        <>
          <ViewSection title="Document">
            <ViewGrid>
              <ViewField label="Voucher No" value={data.document.no} strong />
              <ViewField label="Date" value={fmtDate(data.document.date)} />
            </ViewGrid>
            <div className="mt-3"><StatusBadge status={data.status} /></div>
          </ViewSection>

          <ViewSection title="Customer">
            <ViewGrid>
              <ViewField label="Customer" value={data.customerInformation.customerNameSnapshot} strong />
              <ViewField label="Address" value={data.customerInformation.address} />
            </ViewGrid>
          </ViewSection>

          <ViewSection title="Receipt Details">
            <ViewGrid>
              <ViewField label="Account / Ledger" value={data.accountInformation.ledgerNameSnapshot} />
              <ViewField label="Reference No" value={data.receiptDetails.referenceNo} />
              <ViewField label="Instrument No" value={data.receiptDetails.instrumentNo} />
              <ViewField label="Instrument Date" value={data.receiptDetails.instrumentDate ? fmtDate(data.receiptDetails.instrumentDate) : undefined} />
              <ViewField label="Amount" value={fmt(data.receiptDetails.amount)} strong />
              <ViewField label="Total Allocated" value={fmt(data.receiptDetails.totalAllocated)} />
              <ViewField label="Total Discount" value={fmt(data.receiptDetails.totalDiscount)} />
              <ViewField label="Advance" value={fmt(data.receiptDetails.advance)} />
            </ViewGrid>
            {data.receiptDetails.notes && (
              <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                <p className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Notes</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{data.receiptDetails.notes}</p>
              </div>
            )}
          </ViewSection>

          {data.allocations.length > 0 && (
            <ViewSection title="Invoice Allocations" className="col-span-full">
              <ViewTable>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className={TH}>#</th>
                    <th className={TH}>Invoice No</th>
                    <th className={TH}>Date</th>
                    <th className={TH}>Due Date</th>
                    <th className={TH_R}>Original</th>
                    <th className={TH_R}>Outstanding Before</th>
                    <th className={TH_R}>Received</th>
                    <th className={TH_R}>Discount</th>
                    <th className={TH_R}>Outstanding After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data.allocations.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <td className={TD}>{a.sno}</td>
                      <td className={TD}>{a.sourceNo}</td>
                      <td className={TD}>{fmtDate(a.sourceDate)}</td>
                      <td className={TD}>{a.sourceDueDate ? fmtDate(a.sourceDueDate) : "—"}</td>
                      <td className={TD_R}>{fmt(a.originalAmount)}</td>
                      <td className={TD_R}>{fmt(a.outstandingBefore)}</td>
                      <td className={`${TD_R} text-green-700 dark:text-green-400`}>{fmt(a.paidAmount)}</td>
                      <td className={TD_R}>{fmt(a.discountAmount)}</td>
                      <td className={`${TD_R} font-semibold`}>{fmt(a.outstandingAfter)}</td>
                    </tr>
                  ))}
                </tbody>
              </ViewTable>
            </ViewSection>
          )}

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
