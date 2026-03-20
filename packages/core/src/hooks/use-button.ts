import { useCallback, useMemo } from "react";
import { createKeyboardHandler } from "../utils/create-keyboard-handler.js";
import type { PropGetterReturn } from "../types/prop-getters.js";
import type { InteractionKeyMap } from "../types/interactions.js";

export interface UseButtonOptions {
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Called when the button is activated (press or keyboard) */
  onPress?: () => void;
  /**
   * The semantic element type the platform layer will render.
   * If "button", role is omitted (implicit). Otherwise role="button" is set.
   * Defaults to "button".
   */
  elementType?: "button" | "div" | "span" | "a" | string;
}

export interface UseButtonReturn {
  /** Whether interaction is disabled (disabled OR loading) */
  isDisabled: boolean;
  /** Whether the button is loading */
  isLoading: boolean;
  /** Returns props for the button element */
  getButtonProps: (overrides?: { onAction?: () => void }) => PropGetterReturn;
}

const BUTTON_KEY_MAP: InteractionKeyMap = {
  Enter: "activate",
  " ": "activate",
};

/**
 * Headless button hook.
 *
 * Provides state and prop getter for button-like elements.
 * Platform layers map the returned props to DOM/native attributes.
 */
export function useButton(options: UseButtonOptions = {}): UseButtonReturn {
  const {
    disabled = false,
    loading = false,
    onPress,
    elementType = "button",
  } = options;

  const isDisabled = disabled || loading;

  const keyboardConfig = useMemo(
    () => createKeyboardHandler(BUTTON_KEY_MAP),
    [],
  );

  const getButtonProps = useCallback(
    (overrides?: { onAction?: () => void }): PropGetterReturn => {
      const action = overrides?.onAction ?? onPress;

      return {
        accessibility: {
          // Only set role explicitly if the element is not a native <button>
          role: elementType === "button" ? undefined : "button",
          disabled: isDisabled || undefined,
          busy: loading || undefined,
          // Non-native buttons need tabIndex for focusability
          tabIndex: isDisabled ? -1 : elementType === "button" ? undefined : 0,
        },
        keyboardConfig: isDisabled ? undefined : keyboardConfig,
        onAction: isDisabled ? undefined : action,
      };
    },
    [isDisabled, loading, onPress, elementType, keyboardConfig],
  );

  return {
    isDisabled,
    isLoading: loading,
    getButtonProps,
  };
}
