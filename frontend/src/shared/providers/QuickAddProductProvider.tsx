import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Product } from "@/redux/api/productApi";
import QuickAddProductModal from "@/shared/components/quick-add/QuickAddProductModal";

interface QuickAddProductContextValue {
  openProductQuickAdd: (
    keyword: string,
    onSuccess: (product: Product) => void,
  ) => void;
}

const QuickAddProductContext = createContext<
  QuickAddProductContextValue | undefined
>(undefined);

export function QuickAddProductProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const onSuccessRef = useRef<((product: Product) => void) | null>(null);

  const openProductQuickAdd = useCallback(
    (kw: string, onSuccess: (product: Product) => void) => {
      onSuccessRef.current = onSuccess;
      setKeyword(kw);
      setOpen(true);
    },
    [],
  );

  const handleSuccess = useCallback((product: Product) => {
    onSuccessRef.current?.(product);
    setOpen(false);
  }, []);

  return (
    <QuickAddProductContext.Provider value={{ openProductQuickAdd }}>
      {children}
      <QuickAddProductModal
        open={open}
        keyword={keyword}
        onClose={() => setOpen(false)}
        onSuccess={handleSuccess}
      />
    </QuickAddProductContext.Provider>
  );
}

export function useQuickAddProductContext() {
  const ctx = useContext(QuickAddProductContext);
  if (!ctx) throw new Error("useQuickAddProductContext must be used inside QuickAddProductProvider");
  return ctx;
}
