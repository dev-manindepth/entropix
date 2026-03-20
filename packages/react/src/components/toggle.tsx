import { forwardRef, useCallback, useMemo } from "react";
import { useToggle } from "@entropix/core";
import type { UseToggleOptions } from "@entropix/core";
import { mapAccessibilityToAria } from "../utils/map-accessibility-to-aria.js";
import { useKeyboardHandler } from "../utils/use-keyboard-handler.js";
import { cn } from "../utils/cn.js";
import "../styles/toggle.css";

export interface ToggleProps
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
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Accessible label (if no children) */
  label?: string;
}

/** Internal props used by Switch to override the role */
interface ToggleInternalProps extends ToggleProps {
  /** @internal Override the ARIA role */
  role?: UseToggleOptions["role"];
  /** @internal CSS class name for the component (toggle or switch) */
  componentClass?: string;
}

/**
 * Toggle component — web adapter for @entropix/core's useToggle.
 *
 * Renders a `<button type="button">` with role="checkbox".
 * Use the Switch component for role="switch" semantics.
 * Sets data-state="checked"|"unchecked" for CSS targeting.
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  function Toggle(props, ref) {
    return <ToggleInner {...props} ref={ref} role="checkbox" componentClass="entropix-toggle" />;
  },
);

/** @internal Shared implementation for Toggle and Switch */
export const ToggleInner = forwardRef<HTMLButtonElement, ToggleInternalProps>(
  function ToggleInner(
    {
      checked,
      defaultChecked,
      onChange,
      disabled,
      label,
      role = "checkbox",
      componentClass = "entropix-toggle",
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
      role,
    });

    const propGetterReturn = getToggleProps();
    const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

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

    return (
      <button
        ref={ref}
        type="button"
        className={cn(componentClass, className)}
        style={style}
        {...ariaProps}
        {...rest}
        disabled={isDisabled || undefined}
        onClick={propGetterReturn.onAction || onClick ? handleClick : undefined}
        onKeyDown={onKeyDown || externalOnKeyDown ? handleKeyDown : undefined}
        data-state={isChecked ? "checked" : "unchecked"}
      >
        {children}
      </button>
    );
  },
);
