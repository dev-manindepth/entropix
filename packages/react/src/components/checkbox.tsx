import { forwardRef, useCallback, useMemo } from "react";
import { useToggle } from "@entropix/core";
import { mapAccessibilityToAria } from "../utils/map-accessibility-to-aria.js";
import { useKeyboardHandler } from "../utils/use-keyboard-handler.js";
import { cn } from "../utils/cn.js";
import "../styles/checkbox.css";

export interface CheckboxProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onChange" | "disabled"
  > {
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state for uncontrolled mode */
  defaultChecked?: boolean;
  /** Called when checked state changes */
  onChange?: (checked: boolean) => void;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Accessible label text */
  label?: string;
  /** Whether the checkbox is in an indeterminate state */
  indeterminate?: boolean;
}

/**
 * Checkbox component — web adapter for @entropix/core's useToggle.
 *
 * Renders a `<button type="button">` with role="checkbox" containing
 * an indicator span and a label span.
 * Sets data-state="checked"|"unchecked"|"indeterminate" for CSS targeting.
 */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox(
    {
      checked,
      defaultChecked,
      onChange,
      disabled,
      label,
      indeterminate = false,
      className,
      style,
      children,
      onClick,
      onKeyDown: externalOnKeyDown,
      ...rest
    },
    ref,
  ) {
    const { isChecked, isDisabled, getToggleProps } = useToggle({
      checked,
      defaultChecked,
      onChange,
      disabled,
      role: "checkbox",
    });

    const propGetterReturn = getToggleProps();
    const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

    // Override aria-checked for indeterminate state
    if (indeterminate) {
      ariaProps["aria-checked"] = "mixed";
    }

    // Add explicit label if provided and no children
    if (label && !children) {
      ariaProps["aria-label"] = label;
    }

    const actionMap = useMemo(
      () => ({
        toggle: propGetterReturn.onAction ?? (() => {}),
      }),
      [propGetterReturn.onAction],
    );

    const onKeyDown = useKeyboardHandler(
      propGetterReturn.keyboardConfig,
      actionMap,
    );

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        propGetterReturn.onAction?.();
        onClick?.(event);
      },
      [propGetterReturn.onAction, onClick],
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        externalOnKeyDown?.(event);
      },
      [onKeyDown, externalOnKeyDown],
    );

    const dataState = indeterminate
      ? "indeterminate"
      : isChecked
        ? "checked"
        : "unchecked";

    return (
      <button
        ref={ref}
        type="button"
        className={cn("entropix-checkbox", className)}
        style={style}
        {...ariaProps}
        {...rest}
        disabled={isDisabled || undefined}
        onClick={propGetterReturn.onAction || onClick ? handleClick : undefined}
        onKeyDown={onKeyDown || externalOnKeyDown ? handleKeyDown : undefined}
        data-state={dataState}
      >
        <span className="entropix-checkbox__indicator" data-state={dataState} />
        {(label || children) && (
          <span className="entropix-checkbox__label">
            {label || children}
          </span>
        )}
      </button>
    );
  },
);
