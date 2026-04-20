import Button from "../../../ui/button/Button";

interface UomHeaderProps {
  onAdd: () => void;
}

export default function UomHeader({ onAdd }: UomHeaderProps) {
  return (
    <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center lg:gap-0">
      {/* <h3 className="text-start text-lg font-semibold text-gray-800 dark:text-white/90">
        UOM Master
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
