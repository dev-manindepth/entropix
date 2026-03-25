import { forwardRef, useCallback } from "react";
import { cn } from "../../utils/cn.js";
import { useLocale } from "../../i18n/i18n-context.js";
import type { ToastType } from "./toast-context.js";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  message: string;
  type: ToastType;
  onDismiss: (id: string) => void;
}

const ICONS: Record<ToastType, string> = {
  success: "\u2713",
  error: "\u2715",
  warning: "\u26A0",
  info: "\u2139",
};

/**
 * Toast — individual toast notification.
 *
 * Renders an icon, message, and close button with type-based styling.
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  function Toast({ id, message, type, onDismiss, className, ...rest }, ref) {
    const locale = useLocale();
    const handleDismiss = useCallback(() => {
      onDismiss(id);
    }, [id, onDismiss]);

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn("entropix-toast", `entropix-toast--${type}`, className)}
        data-type={type}
        {...rest}
      >
        <span className="entropix-toast__icon" aria-hidden="true">
          {ICONS[type]}
        </span>
        <span className="entropix-toast__message">{message}</span>
        <button
          type="button"
          className="entropix-toast__close"
          onClick={handleDismiss}
          aria-label={locale.toast_dismiss}
        >
          &#10005;
        </button>
      </div>
    );
  },
);
