import { forwardRef, useCallback } from "react";
import { useDialogContext } from "./dialog-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { cn } from "../../utils/cn.js";
import "../../styles/dialog.css";

export interface DialogOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * DialogOverlay — backdrop element behind the dialog.
 * Hidden from the accessibility tree. Optionally closes the dialog on click.
 */
export const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  function DialogOverlay({ className, onClick, ...rest }, ref) {
    const { isOpen, getOverlayProps } = useDialogContext();
    const propGetterReturn = getOverlayProps();
    const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        propGetterReturn.onAction?.();
        onClick?.(event);
      },
      [propGetterReturn.onAction, onClick],
    );

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        {...ariaProps}
        {...rest}
        className={cn("entropix-dialog-overlay", className)}
        onClick={propGetterReturn.onAction || onClick ? handleClick : undefined}
        data-state={isOpen ? "open" : "closed"}
      />
    );
  },
);
