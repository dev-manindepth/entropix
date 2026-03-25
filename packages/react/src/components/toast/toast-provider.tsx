import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ToastContext } from "./toast-context.js";
import type { ToastItem, AddToastOptions } from "./toast-context.js";
import { Toast } from "./toast.js";
import { cn } from "../../utils/cn.js";
import "../../styles/toast.css";

export interface ToastProviderProps {
  children: React.ReactNode;
  /** Auto-dismiss duration in ms. Set to 0 to disable. Default: 5000 */
  duration?: number;
  /** Maximum number of visible toasts. Default: 5 */
  maxToasts?: number;
  className?: string;
}

let toastCounter = 0;

/**
 * ToastProvider — wraps children and provides toast context.
 *
 * Renders a fixed-position toast container via createPortal.
 * SSR-safe via useEffect mount gating.
 */
export function ToastProvider({
  children,
  duration = 5000,
  maxToasts = 5,
  className,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  const add = useCallback(
    (options: AddToastOptions): string => {
      const { message, type = "info" } = options;
      const id = `toast-${++toastCounter}`;
      const newToast: ToastItem = { id, message, type };

      setToasts((prev) => {
        const next = [...prev, newToast];
        // Trim to maxToasts
        if (next.length > maxToasts) {
          const removed = next.splice(0, next.length - maxToasts);
          removed.forEach((t) => {
            const timer = timersRef.current.get(t.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(t.id);
            }
          });
        }
        return next;
      });

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismiss(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [duration, maxToasts, dismiss],
  );

  const contextValue = { toasts, add, dismiss, dismissAll };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {mounted &&
        createPortal(
          <div className={cn("entropix-toast-container", className)}>
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                id={toast.id}
                message={toast.message}
                type={toast.type}
                onDismiss={dismiss}
              />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
