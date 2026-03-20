import { createContext, useContext } from "react";
import type { UseRadioGroupReturn } from "@entropix/core";

export const RadioGroupContext = createContext<UseRadioGroupReturn | null>(null);

export function useRadioGroupContext(): UseRadioGroupReturn {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error(
      "Radio compound components must be used within a <RadioGroup> provider.",
    );
  }
  return context;
}
