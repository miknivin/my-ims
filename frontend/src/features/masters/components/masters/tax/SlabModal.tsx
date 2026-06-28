import { useEffect, useState } from "react";
import Input from "@/shared/components/form/input/InputField";
import Label from "@/shared/components/form/Label";
import Button from "@/shared/components/ui/button/Button";
import { Modal } from "@/shared/components/ui/modal";

export interface SlabDraft {
  fromAmount: string;
  toAmount: string;
  rate: string;
}

interface SlabModalProps {
  open: boolean;
  initial?: SlabDraft | null;
  existingSlabs: SlabDraft[];
  editingIndex: number | null;
  onSave: (slab: SlabDraft) => void;
  onClose: () => void;
}

const empty = (): SlabDraft => ({ fromAmount: "", toAmount: "", rate: "" });

function overlaps(a: SlabDraft, b: SlabDraft): boolean {
  return Number(a.fromAmount) <= Number(b.toAmount) && Number(b.fromAmount) <= Number(a.toAmount);
}

export default function SlabModal({
  open,
  initial,
  existingSlabs,
  editingIndex,
  onSave,
  onClose,
}: SlabModalProps) {
  const [slab, setSlab] = useState<SlabDraft>(empty());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setSlab({ ...initial });
    } else {
      const lastSlab = existingSlabs[existingSlabs.length - 1];
      const autoFrom = lastSlab ? (Number(lastSlab.toAmount) + 1).toString() : "";
      setSlab({ fromAmount: autoFrom, toAmount: "", rate: "" });
    }
    setError("");
  }, [open]);

  const set = (field: keyof SlabDraft, value: string) =>
    setSlab((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!slab.fromAmount.trim() || !slab.toAmount.trim() || !slab.rate.trim()) {
      setError("All three fields are required.");
      return;
    }
    if (Number(slab.fromAmount) >= Number(slab.toAmount)) {
      setError("'To amount' must be greater than 'From amount'.");
      return;
    }
    if (Number(slab.rate) < 0) {
      setError("Rate cannot be negative.");
      return;
    }

    const conflict = existingSlabs.find((existing, i) => {
      if (i === editingIndex) return false;
      return overlaps(slab, existing);
    });

    if (conflict) {
      setError(
        `Range ${slab.fromAmount}–${slab.toAmount} overlaps with an existing slab (${conflict.fromAmount}–${conflict.toAmount}).`
      );
      return;
    }

    onSave(slab);
  };

  return (
    <Modal isOpen={open} onClose={onClose} className="max-w-md p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        {initial ? "Edit Slab" : "Add Slab"}
      </h3>
      <div className="space-y-4">
        <div>
          <Label>From Amount<span className="text-error-500">*</span></Label>
          <Input
            type="number"
            placeholder="0"
            value={slab.fromAmount}
            onChange={(e) => set("fromAmount", e.target.value)}
          />
        </div>
        <div>
          <Label>To Amount<span className="text-error-500">*</span></Label>
          <Input
            type="number"
            placeholder="250000"
            value={slab.toAmount}
            onChange={(e) => set("toAmount", e.target.value)}
          />
        </div>
        <div>
          <Label>Rate (%)<span className="text-error-500">*</span></Label>
          <Input
            type="number"
            placeholder="5"
            value={slab.rate}
            onChange={(e) => set("rate", e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-error-500">{error}</p> : null}
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSave}>
            {initial ? "Update" : "Add"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
