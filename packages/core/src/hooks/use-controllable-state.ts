import { useState, useCallback, useRef } from "react";
import type { ControllableStateOptions } from "../types/shared.js";

/**
 * Manages controlled/uncontrolled state pattern.
 *
 * If `value` is provided (not undefined), the component is controlled —
 * internal state is ignored and onChange is the only way to update.
 * If `value` is undefined, the component manages its own state
 * and calls onChange as a notification.
 *
 * This is the foundational state hook for all controllable components
 * (toggle, dialog, etc.).
 */
export function useControllableState<T>(
  options: ControllableStateOptions<T>,
): [T, (next: T | ((prev: T) => T)) => void] {
  const { value: controlledValue, defaultValue, onChange } = options;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<T>(defaultValue);

  // Track controlled flag in ref to avoid stale closures
  const isControlledRef = useRef(isControlled);
  isControlledRef.current = isControlled;

  const currentValue = isControlled ? controlledValue : internalValue;

  // Stabilize onChange ref to avoid unnecessary re-renders
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolvedValue =
        typeof next === "function"
          ? (next as (prev: T) => T)(currentValue)
          : next;

      if (!isControlledRef.current) {
        setInternalValue(resolvedValue);
      }

      onChangeRef.current?.(resolvedValue);
    },
    [currentValue],
  );

  return [currentValue, setValue];
}
