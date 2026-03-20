import { useCallback } from "react";
import { useControllableState } from "./use-controllable-state.js";
import { useIds } from "./use-id.js";
import type { PropGetterReturn } from "../types/prop-getters.js";

export interface UseInputOptions {
  /** Controlled value */
  value?: string;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Called when the value changes */
  onChange?: (value: string) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is read-only */
  readOnly?: boolean;
  /** Whether the input is required */
  required?: boolean;
  /** Whether the input is in an invalid state */
  invalid?: boolean;
  /** Input type */
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  /** Placeholder text */
  placeholder?: string;
  /** Form field name */
  name?: string;
}

export interface UseInputReturn {
  /** Current input value */
  value: string;
  /** Whether the input is disabled */
  isDisabled: boolean;
  /** Whether the input is read-only */
  isReadOnly: boolean;
  /** Whether the input is required */
  isRequired: boolean;
  /** Whether the input is invalid */
  isInvalid: boolean;
  /** Set the value explicitly */
  setValue: (value: string) => void;
  /** Props for the input element */
  getInputProps: () => PropGetterReturn;
  /** Props for the label element */
  getLabelProps: () => { id: string; htmlFor: string };
  /** Props for the helper text element */
  getHelperTextProps: () => { id: string };
  /** Props for the error message element */
  getErrorMessageProps: () => {
    id: string;
    role: "alert";
    "aria-live": "polite";
  };
}

/**
 * Headless input hook for text input patterns.
 *
 * Manages value state, validation, and ARIA relationships between
 * input, label, helper text, and error message elements.
 * Platform layers map the returned props to DOM/native attributes.
 */
export function useInput(options: UseInputOptions = {}): UseInputReturn {
  const {
    value: controlledValue,
    defaultValue = "",
    onChange,
    disabled = false,
    readOnly = false,
    required = false,
    invalid = false,
  } = options;

  const [value, setValue] = useControllableState<string>({
    value: controlledValue,
    defaultValue,
    onChange,
  });

  const inputIds = useIds("input", "input", "label", "helper", "error");

  const ids = {
    input: inputIds["input"]!,
    label: inputIds["label"]!,
    helper: inputIds["helper"]!,
    error: inputIds["error"]!,
  };

  const getInputProps = useCallback((): PropGetterReturn => {
    return {
      accessibility: {
        role: "textbox",
        disabled: disabled || undefined,
        required: required || undefined,
        invalid: invalid || undefined,
        describedBy: invalid ? ids.error : ids.helper,
        labelledBy: ids.label,
        tabIndex: disabled ? -1 : 0,
      },
    };
  }, [disabled, required, invalid, ids.error, ids.helper, ids.label]);

  const getLabelProps = useCallback(() => {
    return {
      id: ids.label,
      htmlFor: ids.input,
    };
  }, [ids.label, ids.input]);

  const getHelperTextProps = useCallback(() => {
    return {
      id: ids.helper,
    };
  }, [ids.helper]);

  const getErrorMessageProps = useCallback(() => {
    return {
      id: ids.error,
      role: "alert" as const,
      "aria-live": "polite" as const,
    };
  }, [ids.error]);

  return {
    value,
    isDisabled: disabled,
    isReadOnly: readOnly,
    isRequired: required,
    isInvalid: invalid,
    setValue: (v: string) => setValue(v),
    getInputProps,
    getLabelProps,
    getHelperTextProps,
    getErrorMessageProps,
  };
}
