import { forwardRef, useCallback, useRef } from "react";
import { usePopoverContext } from "./popover-context.js";
import { cn } from "../../utils/cn.js";

export interface PopoverTriggerProps
  extends React.HTMLAttributes<HTMLElement> {
  /** Render as a different element. Default: wraps children in a span */
  asChild?: boolean;
}

/**
 * PopoverTrigger — element that opens/closes the popover.
 *
 * For click mode: onClick handler.
 * For hover mode: onMouseEnter/onMouseLeave with delay.
 */
export const PopoverTrigger = forwardRef<HTMLElement, PopoverTriggerProps>(
  function PopoverTrigger({ children, className, onClick, onMouseEnter, onMouseLeave, ...rest }, ref) {
    const { toggle, open, close, triggerRef, triggerId, contentId, isOpen, triggerMode } =
      usePopoverContext();
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        if (triggerMode === "click") {
          toggle();
        }
        onClick?.(event);
      },
      [triggerMode, toggle, onClick],
    );

    const handleMouseEnter = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        if (triggerMode === "hover") {
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
          }
          hoverTimeoutRef.current = setTimeout(() => {
            open();
          }, 100);
        }
        onMouseEnter?.(event);
      },
      [triggerMode, open, onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        if (triggerMode === "hover") {
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
          }
          hoverTimeoutRef.current = setTimeout(() => {
            close();
          }, 200);
        }
        onMouseLeave?.(event);
      },
      [triggerMode, close, onMouseLeave],
    );

    return (
      <span
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLElement | null>).current = node;
          }
        }}
        id={triggerId}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? contentId : undefined}
        {...rest}
        className={cn("entropix-popover-trigger", className)}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: "inline-flex", ...rest.style }}
      >
        {children}
      </span>
    );
  },
);
