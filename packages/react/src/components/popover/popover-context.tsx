import { createContext, useContext } from "react";

export type PopoverPlacement = "top" | "bottom" | "left" | "right";
export type PopoverTriggerMode = "click" | "hover";

export interface PopoverContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentId: string;
  triggerId: string;
  placement: PopoverPlacement;
  triggerMode: PopoverTriggerMode;
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
