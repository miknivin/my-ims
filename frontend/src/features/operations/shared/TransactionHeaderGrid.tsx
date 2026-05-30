export default function TransactionHeaderGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
      }}
    >
      {children}
    </div>
  );
}
