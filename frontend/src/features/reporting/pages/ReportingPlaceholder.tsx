import ReportLayout from "../components/ReportLayout";

interface ReportingPlaceholderProps {
  title: string;
}

export default function ReportingPlaceholder({
  title,
}: ReportingPlaceholderProps) {
  return (
    <ReportLayout>
      <ReportLayout.Breadcrumb title={title} />
      <ReportLayout.Content>
        <ReportLayout.EmptyState
          title="Report shell is ready"
          description="This report is intentionally added as placeholder content for the next integration pass."
        />
      </ReportLayout.Content>
    </ReportLayout>
  );
}
