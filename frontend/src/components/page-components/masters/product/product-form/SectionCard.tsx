export default function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h2>
      {children}
    </div>
  );
}
