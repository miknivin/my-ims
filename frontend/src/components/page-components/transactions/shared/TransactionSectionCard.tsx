export default function TransactionSectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-800 dark:text-gray-100">
          {title}
        </p>
      </div>
      {children}
    </section>
  );
}
