import { forwardRef } from "react";
import { useDialogContext } from "./dialog-context.js";
import { cn } from "../../utils/cn.js";

export interface DialogDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

/**
 * DialogDescription — paragraph element with auto-linked ID for aria-describedby.
 */
export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(function DialogDescription({ children, className, ...rest }, ref) {
  const { ids } = useDialogContext();

  return (
    <p ref={ref} id={ids.description} {...rest} className={cn("entropix-dialog-description", className)}>
      {children}
    </p>
  );
});
