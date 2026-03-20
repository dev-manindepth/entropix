import { forwardRef } from "react";
import { useDialogContext } from "./dialog-context.js";
import { cn } from "../../utils/cn.js";

export interface DialogTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

/**
 * DialogTitle — heading element with auto-linked ID for aria-labelledby.
 */
export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle({ children, className, ...rest }, ref) {
    const { ids } = useDialogContext();

    return (
      <h2 ref={ref} id={ids.title} {...rest} className={cn("entropix-dialog-title", className)}>
        {children}
      </h2>
    );
  },
);
