import { forwardRef, useCallback } from "react";
import { useDialogContext } from "./dialog-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { cn } from "../../utils/cn.js";

export interface DialogCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

/**
 * DialogClose — button that closes the dialog.
 * Maps core's getCloseProps() to DOM attributes.
 */
export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  function DialogClose({ children, className, onClick, ...rest }, ref) {
    const { getCloseProps } = useDialogContext();
    const propGetterReturn = getCloseProps();
    const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        propGetterReturn.onAction?.();
        onClick?.(event);
      },
      [propGetterReturn.onAction, onClick],
    );

    return (
      <button
        ref={ref}
        type="button"
        {...ariaProps}
        {...rest}
        className={cn("entropix-dialog-close", className)}
        onClick={handleClick}
      >
        {children}
      </button>
    );
  },
);
