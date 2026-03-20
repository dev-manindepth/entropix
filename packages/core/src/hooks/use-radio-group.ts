import { useCallback, useMemo } from "react";
import { useControllableState } from "./use-controllable-state.js";
import { createKeyboardHandler } from "../utils/create-keyboard-handler.js";
import type { PropGetterReturn } from "../types/prop-getters.js";
import type { InteractionKeyMap } from "../types/interactions.js";

export interface UseRadioGroupOptions {
  /** Controlled selected value */
  value?: string;
  /** Default selected value for uncontrolled mode */
  defaultValue?: string;
  /** Called when the selected value changes */
  onChange?: (value: string) => void;
  /** Whether the entire radio group is disabled */
  disabled?: boolean;
  /** Layout orientation. Default: "vertical" */
  orientation?: "horizontal" | "vertical";
  /** Arrow keys wrap around when reaching start/end. Default: true */
  loop?: boolean;
}

export interface UseRadioGroupReturn {
  /** Currently selected value */
  selectedValue: string;
  /** Whether the group is disabled */
  isDisabled: boolean;
  /** Set the selected value explicitly */
  setSelectedValue: (value: string) => void;
  /** Props for the radio group container */
  getRadioGroupProps: () => PropGetterReturn;
  /** Props for an individual radio option */
  getRadioProps: (
    value: string,
    options?: { disabled?: boolean },
  ) => PropGetterReturn;
}

const RADIO_KEY_MAP: InteractionKeyMap = {
  ArrowDown: "focusNext",
  ArrowRight: "focusNext",
  ArrowUp: "focusPrevious",
  ArrowLeft: "focusPrevious",
};

/**
 * Headless radio group hook.
 *
 * Manages single-selection state across a group of radio options.
 * Implements roving tabIndex and keyboard navigation intents.
 * Platform layers map the returned props to DOM/native attributes.
 */
export function useRadioGroup(
  options: UseRadioGroupOptions = {},
): UseRadioGroupReturn {
  const {
    value: controlledValue,
    defaultValue = "",
    onChange,
    disabled = false,
    orientation = "vertical",
  } = options;

  const [selectedValue, setSelectedValue] = useControllableState<string>({
    value: controlledValue,
    defaultValue,
    onChange,
  });

  const radioKeyboardConfig = useMemo(
    () => createKeyboardHandler(RADIO_KEY_MAP),
    [],
  );

  const getRadioGroupProps = useCallback((): PropGetterReturn => {
    return {
      accessibility: {
        role: "radiogroup",
        orientation,
        disabled: disabled || undefined,
      },
    };
  }, [orientation, disabled]);

  const getRadioProps = useCallback(
    (value: string, opts?: { disabled?: boolean }): PropGetterReturn => {
      const isDisabled = disabled || (opts?.disabled ?? false);
      const isChecked = value === selectedValue;

      return {
        accessibility: {
          role: "radio",
          checked: isChecked,
          disabled: isDisabled || undefined,
          tabIndex: isChecked ? 0 : -1,
        },
        keyboardConfig: isDisabled ? undefined : radioKeyboardConfig,
        onAction: isDisabled
          ? undefined
          : () => {
              setSelectedValue(value);
            },
      };
    },
    [disabled, selectedValue, radioKeyboardConfig, setSelectedValue],
  );

  return {
    selectedValue,
    isDisabled: disabled,
    setSelectedValue: (v: string) => setSelectedValue(v),
    getRadioGroupProps,
    getRadioProps,
  };
}
