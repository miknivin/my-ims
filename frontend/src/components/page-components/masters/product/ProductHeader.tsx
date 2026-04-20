import Button from "../../../ui/button/Button";

export default function ProductHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center lg:gap-0">
      {/* <h3 className="text-start text-lg font-semibold text-gray-800 dark:text-white/90">
        Product Master
      </h3> */}
      <Button onClick={onAdd} size="sm" variant="primary">
        Add +
      </Button>
    </div>
  );
}
