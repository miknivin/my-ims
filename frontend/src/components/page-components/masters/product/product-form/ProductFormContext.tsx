import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Product } from "../../../../../app/api/productApi";
import { createProductFormState, ProductFormState } from "./types";

type ContextValue = {
  state: ProductFormState;
  setSection: <K extends keyof ProductFormState>(section: K, patch: Partial<ProductFormState[K]>) => void;
};

const ProductFormContext = createContext<ContextValue | undefined>(undefined);

export function ProductFormProvider({ product, children }: { product?: Product | null; children: React.ReactNode }) {
  const [state, setState] = useState<ProductFormState>(() => createProductFormState(product));

  useEffect(() => {
    setState(createProductFormState(product));
  }, [product]);

  const value = useMemo<ContextValue>(
    () => ({
      state,
      setSection: (section, patch) =>
        setState((current) => ({
          ...current,
          [section]: { ...current[section], ...patch },
        })),
    }),
    [state]
  );

  return <ProductFormContext.Provider value={value}>{children}</ProductFormContext.Provider>;
}

export function useProductForm() {
  const context = useContext(ProductFormContext);
  if (!context) {
    throw new Error("useProductForm must be used within ProductFormProvider");
  }
  return context;
}
