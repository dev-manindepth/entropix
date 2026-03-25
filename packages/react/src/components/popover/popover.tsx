import { useState, useCallback, useRef, useId } from "react";
import { PopoverContext } from "./popover-context.js";
import type { PopoverPlacement, PopoverTriggerMode } from "./popover-context.js";
import "../../styles/popover.css";

export interface PopoverProps {
  children: React.ReactNode;
  /** How the popover is triggered. Default: "click" */
  triggerMode?: PopoverTriggerMode;
  /** Placement relative to trigger. Default: "bottom" */
  placement?: PopoverPlacement;
  /** Controlled open state */
  isOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Default open state for uncontrolled usage */
  defaultOpen?: boolean;
}

/**
 * Popover root — provides popover state to compound sub-components.
 * Renders no DOM of its own.
 */
export function Popover({
  children,
  triggerMode = "click",
  placement = "bottom",
  isOpen: controlledIsOpen,
  onOpenChange,
  defaultOpen = false,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalOpen;

  const triggerRef = useRef<HTMLElement | null>(null);
  const baseId = useId();
  const contentId = `${baseId}-popover-content`;
  const triggerId = `${baseId}-popover-trigger`;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const open = useCallback(() => setOpen(true), [setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen(!isOpen), [setOpen, isOpen]);

  return (
    <PopoverContext.Provider
      value={{
        isOpen,
        open,
        close,
        toggle,
        triggerRef,
        contentId,
        triggerId,
        placement,
        triggerMode,
      }}
    >
      {children}
    </PopoverContext.Provider>
  );
}
