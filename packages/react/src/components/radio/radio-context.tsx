import { createContext, useContext } from "react";
import type { UseRadioGroupReturn } from "@entropix/core";

export const RadioContext = createContext<UseRadioGroupReturn | null>(null);

export function useRadioContext(): UseRadioGroupReturn {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error(
      "Radio compound components must be used within a <RadioGroup> provider.",
    );
  }
  return context;
}
