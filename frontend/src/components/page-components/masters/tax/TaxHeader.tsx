import Button from "../../../ui/button/Button";

interface TaxHeaderProps {
  onAdd: () => void;
}

export default function TaxHeader({ onAdd }: TaxHeaderProps) {
  return (
    <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center lg:gap-0">
      {/* <h3 className="text-start text-lg font-semibold text-gray-800 dark:text-white/90">
        Tax Master
      </h3> */}
      <div className="flex flex-wrap-reverse items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button onClick={onAdd} size="sm" variant="primary">
            Add +
          </Button>
        </div>
      </div>
    </div>
  );
}
