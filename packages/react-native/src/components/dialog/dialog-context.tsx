import { createContext, useContext } from "react";
import type { UseDialogReturn } from "@entropix/core";

export const DialogContext = createContext<UseDialogReturn | null>(null);

/**
 * Hook to access the nearest Dialog context.
 * Throws if used outside a <Dialog> component.
 */
export function useDialogContext(): UseDialogReturn {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(
      "Dialog compound components must be used within a <Dialog> provider.",
    );
  }
  return context;
}
