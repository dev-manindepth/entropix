import { forwardRef, useRef, useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useDialogContext } from "./dialog-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { useKeyboardHandler } from "../../utils/use-keyboard-handler.js";
import { useFocusTrap } from "../../focus/use-focus-trap.js";
import { useFocusRestore } from "../../focus/use-focus-restore.js";
import { cn } from "../../utils/cn.js";

export interface DialogContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * DialogContent — the dialog panel rendered in a portal.
 *
 * Implements focus trap, focus restore, Escape-to-close keyboard handling,
 * and portal rendering. SSR-safe via useEffect mount gating.
 */
export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ children, className, onKeyDown: externalOnKeyDown, ...rest }, ref) {
    const { isOpen, close, ids, focusManagement, getContentProps } =
      useDialogContext();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
      setMounted(true);
    }, []);

    // Internal ref for focus trap (compose with forwarded ref)
    const internalRef = useRef<HTMLDivElement | null>(null);

    // Focus management
    useFocusTrap(internalRef, isOpen && focusManagement.trapFocus);
    useFocusRestore(isOpen && focusManagement.restoreFocus);

    const propGetterReturn = getContentProps();
    const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

    const actionMap = useMemo(() => ({ dismiss: close }), [close]);
    const onKeyDown = useKeyboardHandler(
      propGetterReturn.keyboardConfig,
      actionMap,
    );

    // Don't render during SSR or when closed
    if (!mounted || !isOpen) return null;

    const content = (
      <div
        ref={(node) => {
          internalRef.current = node;
          // Forward the ref
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
        id={ids.content}
        {...ariaProps}
        {...rest}
        className={cn("entropix-dialog-content", className)}
        onKeyDown={
          onKeyDown
            ? (event: React.KeyboardEvent<HTMLDivElement>) => {
                (onKeyDown as React.KeyboardEventHandler<HTMLElement>)(event);
                externalOnKeyDown?.(event);
              }
            : externalOnKeyDown
        }
        data-state={isOpen ? "open" : "closed"}
      >
        {children}
      </div>
    );

    return createPortal(content, document.body);
  },
);
