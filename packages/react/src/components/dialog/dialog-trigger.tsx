import { forwardRef, useCallback } from "react";
import { useDialogContext } from "./dialog-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { cn } from "../../utils/cn.js";

export interface DialogTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

/**
 * DialogTrigger — button that opens/closes the dialog.
 * Maps core's getTriggerProps() to DOM attributes.
 */
export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  function DialogTrigger({ children, className, onClick, ...rest }, ref) {
    const { getTriggerProps } = useDialogContext();
    const propGetterReturn = getTriggerProps();
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
        className={cn("entropix-dialog-trigger", className)}
        onClick={handleClick}
      >
        {children}
      </button>
    );
  },
);
