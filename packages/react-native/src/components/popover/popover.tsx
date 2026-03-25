import React, { useRef, useState } from "react";
import type { View } from "react-native";
import {
  usePopover,
  type UsePopoverOptions,
} from "@entropix/core";
import { PopoverContext } from "./popover-context.js";

export interface PopoverProps extends UsePopoverOptions {
  children: React.ReactNode;
}

/**
 * Popover root — provides popover state to compound sub-components.
 * Renders no UI of its own.
 */
export function Popover({
  children,
  isOpen,
  defaultOpen,
  onOpenChange,
  placement = "bottom",
  trigger = "click",
  role = "dialog",
  offset = 8,
}: PopoverProps) {
  const popover = usePopover({
    isOpen,
    defaultOpen,
    onOpenChange,
    placement,
    trigger,
    role,
    offset,
  });

  const triggerRef = useRef<View | null>(null);
  const [triggerLayout, setTriggerLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  return (
    <PopoverContext.Provider
      value={{
        isOpen: popover.isOpen,
        open: popover.open,
        close: popover.close,
        toggle: popover.toggle,
        placement: popover.placement,
        triggerMode: popover.trigger,
        triggerRef,
        triggerLayout,
        setTriggerLayout,
        offset: popover.offset,
      }}
    >
      {children}
    </PopoverContext.Provider>
  );
}
