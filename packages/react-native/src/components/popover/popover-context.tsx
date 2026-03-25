import React, { createContext, useContext } from "react";
import type { View } from "react-native";
import type { PopoverPlacement, PopoverTriggerMode } from "@entropix/core";

export interface PopoverContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  placement: PopoverPlacement;
  triggerMode: PopoverTriggerMode;
  triggerRef: React.RefObject<View | null>;
  triggerLayout: { x: number; y: number; width: number; height: number } | null;
  setTriggerLayout: (layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  offset: number;
}

export const PopoverContext = createContext<PopoverContextValue | null>(null);

/**
 * Hook to access the nearest Popover context.
 * Throws if used outside a <Popover> component.
 */
export function usePopoverContext(): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error(
      "Popover compound components must be used within a <Popover> provider.",
    );
  }
  return context;
}
