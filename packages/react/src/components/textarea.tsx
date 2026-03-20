import { forwardRef, useCallback } from "react";
import { useInput } from "@entropix/core";
import { mapAccessibilityToAria } from "../utils/map-accessibility-to-aria.js";
import { cn } from "../utils/cn.js";
import "../styles/input.css";

export interface TextareaProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "onChange" | "disabled" | "value"
  > {
  /** Controlled value */
  value?: string;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Called when the value changes */
  onChange?: (value: string) => void;
  /** Whether the textarea is disabled */
  disabled?: boolean;
  /** Whether the textarea is read-only */
  readOnly?: boolean;
  /** Whether the textarea is required */
  required?: boolean;
  /** Whether the textarea is in an invalid state */
  invalid?: boolean;
  /** Label text */
  label?: string;
  /** Helper text displayed below the textarea */
  helperText?: string;
  /** Error message displayed below the textarea (sets invalid=true when present) */
  errorMessage?: string;
  /** Visual variant */
  variant?: "default" | "filled";
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Number of visible text rows */
  rows?: number;
  /** Resize behavior */
  resize?: "none" | "vertical" | "both";
}

/**
 * Textarea component — web adapter for @entropix/core's useInput.
 *
 * Renders a wrapper div with label, textarea, helper text, and error message.
 * Sets data-state, data-variant, and data-size attributes for CSS targeting.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
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
      rows,
      resize = "vertical",
      className,
      placeholder,
      name,
      style,
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
      placeholder,
      name,
    });

    const propGetterReturn = getInputProps();
    const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);
    const labelProps = getLabelProps();
    const helperProps = getHelperTextProps();
    const errorProps = getErrorMessageProps();

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
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
        <textarea
          ref={ref}
          className="entropix-textarea"
          {...ariaProps}
          {...rest}
          name={name}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
          disabled={isDisabled || undefined}
          readOnly={isReadOnly || undefined}
          rows={rows}
          style={{ ...style, resize }}
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
  },
);
