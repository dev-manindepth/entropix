import { forwardRef, useCallback } from "react";
import { useInput, type UseInputOptions } from "@entropix/core";
import { mapAccessibilityToAria } from "../utils/map-accessibility-to-aria.js";
import { cn } from "../utils/cn.js";
import "../styles/input.css";

export interface InputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "disabled" | "value" | "size"
  > {
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
  /** Label text */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message displayed below the input (sets invalid=true when present) */
  errorMessage?: string;
  /** Visual variant */
  variant?: "default" | "filled";
  /** Size */
  size?: "sm" | "md" | "lg";
}

/**
 * Input component — web adapter for @entropix/core's useInput.
 *
 * Renders a wrapper div with label, input, helper text, and error message.
 * Sets data-state, data-variant, and data-size attributes for CSS targeting.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    value,
    defaultValue,
    onChange,
    disabled,
    readOnly,
    required,
    invalid,
    label,
    helperText,
    errorMessage,
    variant = "default",
    size = "md",
    className,
    type,
    placeholder,
    name,
    ...rest
  },
  ref,
) {
  // When errorMessage is set, auto-set invalid
  const isInvalid = invalid || !!errorMessage;

  const {
    value: inputValue,
    isDisabled,
    isReadOnly,
    isRequired,
    isInvalid: _,
    getInputProps,
    getLabelProps,
    getHelperTextProps,
    getErrorMessageProps,
  } = useInput({
    value,
    defaultValue,
    onChange,
    disabled,
    readOnly,
    required,
    invalid: isInvalid,
    type: type as UseInputOptions["type"],
    placeholder,
    name,
  });

  const propGetterReturn = getInputProps();
  const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);
  const labelProps = getLabelProps();
  const helperProps = getHelperTextProps();
  const errorProps = getErrorMessageProps();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event.target.value);
    },
    [onChange],
  );

  const dataState = isInvalid
    ? "invalid"
    : isDisabled
      ? "disabled"
      : undefined;

  return (
    <div
      className={cn("entropix-input-wrapper", className)}
      data-state={dataState}
      data-variant={variant}
      data-size={size}
    >
      {label && (
        <label
          className="entropix-input-label"
          id={labelProps.id}
          htmlFor={labelProps.htmlFor}
        >
          {label}
          {isRequired && <span className="entropix-input-required">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className="entropix-input"
        {...ariaProps}
        {...rest}
        type={type}
        name={name}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        disabled={isDisabled || undefined}
        readOnly={isReadOnly || undefined}
        data-state={dataState}
        data-variant={variant}
        data-size={size}
      />
      {isInvalid && errorMessage ? (
        <span className="entropix-input-error" {...errorProps}>
          {errorMessage}
        </span>
      ) : helperText ? (
        <span className="entropix-input-helper" {...helperProps}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
});
