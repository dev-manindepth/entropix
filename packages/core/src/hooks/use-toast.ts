import { useState, useCallback, useRef } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export interface UseToastOptions {
  /** Maximum number of visible toasts. Default: 5 */
  maxToasts?: number;
  /** Default auto-dismiss duration in ms. Default: 5000 */
  defaultDuration?: number;
}

export interface UseToastReturn {
  /** Current list of active toasts */
  toasts: ToastItem[];
  /** Add a toast. Returns the generated toast ID */
  add: (toast: {
    message: string;
    type?: ToastType;
    duration?: number;
  }) => string;
  /** Dismiss a single toast by ID */
  dismiss: (id: string) => void;
  /** Dismiss all toasts */
  dismissAll: () => void;
  /** Props for the toast container region */
  getContainerProps: () => {
    role: string;
    "aria-live": string;
    "aria-label": string;
  };
}

let toastCounter = 0;

function generateToastId(): string {
  toastCounter += 1;
  return `toast-${toastCounter}-${Date.now()}`;
}

/**
 * Headless toast notification hook.
 *
 * Manages a list of toast notifications with auto-dismiss via setTimeout.
 * FIFO eviction when maxToasts is exceeded. Provides accessibility
 * attributes for the container region.
 */
export function useToast(options: UseToastOptions = {}): UseToastReturn {
  const { maxToasts = 5, defaultDuration = 5000 } = options;

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    for (const timer of timersRef.current.values()) {
      clearTimeout(timer);
    }
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const add = useCallback(
    (toast: {
      message: string;
      type?: ToastType;
      duration?: number;
    }): string => {
      const id = generateToastId();
      const duration = toast.duration ?? defaultDuration;
      const type = toast.type ?? "info";

      const newToast: ToastItem = {
        id,
        message: toast.message,
        type,
        duration,
      };

      setToasts((prev) => {
        const next = [...prev, newToast];
        // FIFO eviction: remove oldest toasts that exceed maxToasts
        if (next.length > maxToasts) {
          const evicted = next.splice(0, next.length - maxToasts);
          for (const t of evicted) {
            const timer = timersRef.current.get(t.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(t.id);
            }
          }
        }
        return next;
      });

      // Set auto-dismiss timer
      if (duration > 0) {
        const timer = setTimeout(() => {
          timersRef.current.delete(id);
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [defaultDuration, maxToasts],
  );

  const getContainerProps = useCallback(
    () => ({
      role: "region" as const,
      "aria-live": "polite" as const,
      "aria-label": "Notifications",
    }),
    [],
  );

  return {
    toasts,
    add,
    dismiss,
    dismissAll,
    getContainerProps,
  };
}
