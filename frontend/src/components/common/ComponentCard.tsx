interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Body */}
      <div className="p-2 border-t border-gray-100 dark:border-gray-800 sm:p-3">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
