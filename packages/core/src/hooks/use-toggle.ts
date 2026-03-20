import { useCallback, useMemo } from "react";
import { useControllableState } from "./use-controllable-state.js";
import { createKeyboardHandler } from "../utils/create-keyboard-handler.js";
import type { PropGetterReturn } from "../types/prop-getters.js";
import type { InteractionKeyMap } from "../types/interactions.js";

export interface UseToggleOptions {
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state for uncontrolled mode */
  defaultChecked?: boolean;
  /** Called when checked state changes */
  onChange?: (checked: boolean) => void;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /**
   * The semantic role: "checkbox" or "switch".
   * Affects the ARIA role in the returned props.
   * Defaults to "checkbox".
   */
  role?: "checkbox" | "switch";
}

export interface UseToggleReturn {
  /** Current checked state */
  isChecked: boolean;
  /** Whether interaction is disabled */
  isDisabled: boolean;
  /** Toggle the checked state */
  toggle: () => void;
  /** Set checked state explicitly */
  setChecked: (value: boolean) => void;
  /** Returns props for the toggle element */
  getToggleProps: (overrides?: { onAction?: () => void }) => PropGetterReturn;
}

const TOGGLE_KEY_MAP: InteractionKeyMap = {
  " ": "toggle",
  Enter: "toggle",
};

/**
 * Headless toggle hook for checkbox/switch patterns.
 *
 * Supports both controlled and uncontrolled usage via useControllableState.
 * Platform layers map the returned props to DOM/native attributes.
 */
export function useToggle(options: UseToggleOptions = {}): UseToggleReturn {
  const {
    checked: controlledChecked,
    defaultChecked = false,
    onChange,
    disabled = false,
    role = "checkbox",
  } = options;

  const [isChecked, setChecked] = useControllableState<boolean>({
    value: controlledChecked,
    defaultValue: defaultChecked,
    onChange,
  });

  const keyboardConfig = useMemo(
    () => createKeyboardHandler(TOGGLE_KEY_MAP),
    [],
  );

  const toggle = useCallback(() => {
    if (!disabled) {
      setChecked((prev: boolean) => !prev);
    }
  }, [disabled, setChecked]);

  const getToggleProps = useCallback(
    (overrides?: { onAction?: () => void }): PropGetterReturn => {
      const action = overrides?.onAction ?? toggle;

      return {
        accessibility: {
          role,
          checked: isChecked,
          disabled: disabled || undefined,
          tabIndex: disabled ? -1 : 0,
        },
        keyboardConfig: disabled ? undefined : keyboardConfig,
        onAction: disabled ? undefined : action,
      };
    },
    [role, isChecked, disabled, keyboardConfig, toggle],
  );

  return {
    isChecked,
    isDisabled: disabled,
    toggle,
    setChecked: (value: boolean) => setChecked(value),
    getToggleProps,
  };
}
