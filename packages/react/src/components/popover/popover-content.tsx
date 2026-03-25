import { forwardRef, useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { usePopoverContext } from "./popover-context.js";
import { cn } from "../../utils/cn.js";
import type { PopoverPlacement } from "./popover-context.js";

export interface PopoverContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Offset from the trigger in pixels. Default: 8 */
  offset?: number;
}

interface Position {
  top: number;
  left: number;
}

function calculatePosition(
  triggerRect: DOMRect,
  contentEl: HTMLElement,
  placement: PopoverPlacement,
  offset: number,
): Position {
  const contentRect = contentEl.getBoundingClientRect();
  let top = 0;
  let left = 0;

  switch (placement) {
    case "top":
      top = triggerRect.top - contentRect.height - offset;
      left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
      break;
    case "bottom":
      top = triggerRect.bottom + offset;
      left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
      break;
    case "left":
      top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
      left = triggerRect.left - contentRect.width - offset;
      break;
    case "right":
      top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
      left = triggerRect.right + offset;
      break;
  }

  // Keep within viewport bounds
  top = Math.max(8, Math.min(top, window.innerHeight - contentRect.height - 8));
  left = Math.max(8, Math.min(left, window.innerWidth - contentRect.width - 8));

  return { top: top + window.scrollY, left: left + window.scrollX };
}

/**
 * PopoverContent — the popover panel rendered in a portal.
 *
 * Positioned relative to the trigger element. Closes on outside click
 * and Escape key. SSR-safe via useEffect mount gating.
 */
export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent({ children, className, offset = 8, style, ...rest }, ref) {
    const { isOpen, close, triggerRef, contentId, placement, triggerMode } =
      usePopoverContext();

    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
    const internalRef = useRef<HTMLDivElement | null>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      setMounted(true);
    }, []);

    // Position calculation
    useEffect(() => {
      if (!isOpen || !triggerRef.current || !internalRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const pos = calculatePosition(triggerRect, internalRef.current, placement, offset);
      setPosition(pos);
    }, [isOpen, triggerRef, placement, offset]);

    // Close on outside click
    useEffect(() => {
      if (!isOpen || triggerMode === "hover") return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          internalRef.current &&
          !internalRef.current.contains(target) &&
          triggerRef.current &&
          !triggerRef.current.contains(target)
        ) {
          close();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, close, triggerRef, triggerMode]);

    // Close on Escape
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          close();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, close]);

    const handleMouseEnter = useCallback(() => {
      if (triggerMode === "hover") {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
      }
    }, [triggerMode]);

    const handleMouseLeave = useCallback(() => {
      if (triggerMode === "hover") {
        hoverTimeoutRef.current = setTimeout(() => {
          close();
        }, 200);
      }
    }, [triggerMode, close]);

    if (!mounted || !isOpen) return null;

    const positionStyle: React.CSSProperties = {
      position: "absolute",
      top: `${position.top}px`,
      left: `${position.left}px`,
      ...style,
    };

    const content = (
      <div
        ref={(node) => {
          internalRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
        id={contentId}
        role="dialog"
        {...rest}
        className={cn(
          "entropix-popover-content",
          `entropix-popover-content--${placement}`,
          className,
        )}
        style={positionStyle}
        data-state={isOpen ? "open" : "closed"}
        data-placement={placement}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    );

    return createPortal(content, document.body);
  },
);
