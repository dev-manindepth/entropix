import React from "react";
import { Popover } from "./popover.js";
import type { PopoverPlacement } from "./popover-context.js";
import { PopoverTrigger } from "./popover-trigger.js";
import { PopoverContent } from "./popover-content.js";
import { cn } from "../../utils/cn.js";

export interface TooltipProps {
  /** The content to display in the tooltip */
  content: React.ReactNode;
  /** The trigger element */
  children: React.ReactNode;
  /** Placement relative to trigger. Default: "top" */
  placement?: PopoverPlacement;
  /** Additional class name for the tooltip content */
  className?: string;
}

/**
 * Tooltip — convenience wrapper around Popover with hover trigger and tooltip styling.
 *
 * Uses role="tooltip" and compact styling.
 */
export function Tooltip({
  content,
  children,
  placement = "top",
  className,
}: TooltipProps) {
  return (
    <Popover triggerMode="hover" placement={placement}>
      <PopoverTrigger>
        {children}
      </PopoverTrigger>
      <PopoverContent
        role="tooltip"
        className={cn("entropix-tooltip", className)}
        offset={6}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}
