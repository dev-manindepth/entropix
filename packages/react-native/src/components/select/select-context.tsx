import { createContext, useContext } from "react";
import type { UseSelectReturn } from "@entropix/core";

export const SelectContext = createContext<UseSelectReturn | null>(null);

export function useSelectContext(): UseSelectReturn {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error(
      "Select compound components must be used within a <Select> provider.",
    );
  }
  return context;
}
