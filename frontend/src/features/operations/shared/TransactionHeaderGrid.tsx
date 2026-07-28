export default function TransactionHeaderGrid({
  children,
  columns,
}: {
  children: React.ReactNode;
  columns?: number;
}) {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: columns
          ? `repeat(${columns}, minmax(0, 1fr))`
          : "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
      }}
    >
      {children}
    </div>
  );
}
