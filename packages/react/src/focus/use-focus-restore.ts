import { useEffect, useRef } from "react";

/**
 * Saves the currently focused element when isActive transitions to true,
 * and restores focus to it when isActive transitions to false.
 *
 * Guards against elements that have been removed from the DOM.
 * All DOM access inside useEffect for SSR safety.
 */
export function useFocusRestore(isActive: boolean): void {
  const savedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      // Save the currently focused element when activated
      savedElement.current = document.activeElement as HTMLElement | null;
    } else if (savedElement.current) {
      // Restore focus when deactivated
      const el = savedElement.current;
      // Verify element is still in the DOM and focusable
      if (el && document.body.contains(el) && typeof el.focus === "function") {
        el.focus();
      }
      savedElement.current = null;
    }
  }, [isActive]);
}
