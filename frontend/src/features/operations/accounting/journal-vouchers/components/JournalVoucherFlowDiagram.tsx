import { useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { JournalVoucher } from "@/redux/api/journalVoucherApi";

const ENTRY_SPACING = 90;

const SOURCE_LABELS: Record<string, string> = {
  SI: "Sales Invoice",
  PI: "Purchase Invoice",
  GRN: "Goods Receipt Note",
  SO: "Sales Order",
  PO: "Purchase Order",
  SCN: "Sales Credit Note",
  PCN: "Purchase Credit Note",
  SDN: "Sales Debit Note",
  PDN: "Purchase Debit Note",
  BWR: "Bill-wise Receipt",
  BWP: "Bill-wise Payment",
  OB: "Opening Balance",
  DN: "Delivery Note",
};

function getSourceLabel(source: string, voucherNo: string): string {
  if (source === "Manual") return "Manual Journal";
  const prefix = voucherNo.split(/[-/]/)[0].toUpperCase();
  return SOURCE_LABELS[prefix] ?? "Transaction";
}

function formatAmount(value: number) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function SourceNode({ data }: { data: { label: string } }) {
  return (
    <div
      style={{
        background: "#3b82f6",
        color: "#fff",
        borderRadius: 10,
        padding: "10px 18px",
        minWidth: 150,
        textAlign: "center",
        fontSize: 12,
        fontWeight: 600,
        boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
      }}
    >
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#1d4ed8", width: 10, height: 10 }}
      />
    </div>
  );
}

function VoucherNode({
  data,
}: {
  data: { voucherNo: string; date: string; status: string };
}) {
  return (
    <div
      style={{
        background: "#6366f1",
        color: "#fff",
        borderRadius: 10,
        padding: "12px 18px",
        minWidth: 170,
        textAlign: "center",
        fontSize: 12,
        boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#4338ca", width: 10, height: 10 }}
      />
      <div style={{ fontWeight: 700, fontSize: 14 }}>{data.voucherNo}</div>
      <div style={{ opacity: 0.85, marginTop: 3, fontSize: 11 }}>{data.date}</div>
      <div
        style={{
          marginTop: 6,
          background: "rgba(255,255,255,0.2)",
          borderRadius: 20,
          padding: "2px 10px",
          display: "inline-block",
          fontSize: 11,
        }}
      >
        {data.status}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#4338ca", width: 10, height: 10 }}
      />
    </div>
  );
}

function EntryNode({
  data,
}: {
  data: {
    ledgerName: string;
    ledgerCode: string;
    amount: number;
    side: "debit" | "credit";
  };
}) {
  const isDebit = data.side === "debit";
  return (
    <div
      style={{
        background: isDebit ? "#fffbeb" : "#f0fdf4",
        color: isDebit ? "#78350f" : "#14532d",
        border: `1.5px solid ${isDebit ? "#fbbf24" : "#86efac"}`,
        borderRadius: 10,
        padding: "8px 14px",
        minWidth: 200,
        fontSize: 12,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: isDebit ? "#d97706" : "#16a34a",
          width: 10,
          height: 10,
        }}
      />
      <div
        style={{
          fontWeight: 600,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 220,
        }}
      >
        {data.ledgerName}
      </div>
      {data.ledgerCode ? (
        <div style={{ opacity: 0.6, fontSize: 11, marginTop: 1 }}>
          {data.ledgerCode}
        </div>
      ) : null}
      <div style={{ marginTop: 5, fontWeight: 700, fontSize: 13 }}>
        <span
          style={{
            background: isDebit ? "#fef3c7" : "#dcfce7",
            borderRadius: 4,
            padding: "1px 6px",
            marginRight: 5,
            fontSize: 11,
          }}
        >
          {isDebit ? "Dr" : "Cr"}
        </span>
        {formatAmount(data.amount)}
      </div>
    </div>
  );
}

const nodeTypes = {
  source: SourceNode,
  voucher: VoucherNode,
  entry: EntryNode,
};

interface Props {
  voucher: JournalVoucher;
}

export default function JournalVoucherFlowDiagram({ voucher }: Props) {
  const { nodes, edges } = useMemo(() => {
    const n = voucher.entries.length;
    const totalHeight = Math.max(1, n) * ENTRY_SPACING - 20;
    const centerY = (totalHeight - 70) / 2;

    const nodes: Node[] = [
      {
        id: "source",
        type: "source",
        position: { x: 0, y: centerY },
        data: {
          label: getSourceLabel(voucher.source, voucher.voucherNo),
        },
      },
      {
        id: "voucher",
        type: "voucher",
        position: { x: 260, y: centerY - 15 },
        data: {
          voucherNo: voucher.voucherNo,
          date: voucher.postingDate,
          status: voucher.status,
        },
      },
      ...voucher.entries.map((entry, i) => ({
        id: `entry-${entry.id}`,
        type: "entry",
        position: { x: 540, y: i * ENTRY_SPACING },
        data: {
          ledgerName: entry.ledgerName,
          ledgerCode: entry.ledgerCode,
          amount: entry.debitAmount > 0 ? entry.debitAmount : entry.creditAmount,
          side: entry.debitAmount > 0 ? "debit" : "credit",
        },
      })),
    ];

    const edges: Edge[] = [
      {
        id: "source-voucher",
        source: "source",
        target: "voucher",
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
        style: { stroke: "#6366f1", strokeWidth: 2 },
      },
      ...voucher.entries.map((entry) => ({
        id: `voucher-${entry.id}`,
        source: "voucher",
        target: `entry-${entry.id}`,
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: entry.debitAmount > 0 ? "#d97706" : "#16a34a",
        },
        style: {
          stroke: entry.debitAmount > 0 ? "#fbbf24" : "#86efac",
          strokeWidth: 1.5,
        },
      })),
    ];

    return { nodes, edges };
  }, [voucher]);

  return (
    <div style={{ height: 420, width: "100%", borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="#f3f4f6" gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
