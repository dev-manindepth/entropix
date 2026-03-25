import { createContext, useContext } from "react";
import type { ToastType, ToastItem } from "@entropix/core";

export interface AddToastOptions {
  message: string;
  type?: ToastType;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  add: (options: AddToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Hook to access the nearest Toast context.
 * Throws if used outside a <ToastProvider> component.
 */
export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error(
      "useToastContext must be used within a <ToastProvider>.",
    );
  }
  return context;
}
