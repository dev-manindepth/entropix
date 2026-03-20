import React, { useCallback, useMemo } from "react";
import type { KeyIntent } from "@entropix/core";
import { useRadioContext } from "./radio-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { useKeyboardHandler } from "../../utils/use-keyboard-handler.js";
import { cn } from "../../utils/cn.js";

export interface RadioItemProps {
  /** The value this radio option represents */
  value: string;
  /** Whether this specific radio is disabled */
  disabled?: boolean;
  /** Label text */
  label?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * RadioItem component — a single radio option within a RadioGroup.
 *
 * Renders a `<button type="button" role="radio">` with an indicator
 * circle and label. Sets data-state="checked"|"unchecked" for CSS targeting.
 */
export function RadioItem({
  value,
  disabled,
  label,
  children,
  className,
}: RadioItemProps) {
  const { getRadioProps, selectedValue } = useRadioContext();
  const propGetterReturn = getRadioProps(value, { disabled });
  const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

  const isChecked = value === selectedValue;

  const actionMap = useMemo<Partial<Record<KeyIntent, () => void>>>(
    () => ({}),
    [],
  );

  const onKeyDown = useKeyboardHandler(
    propGetterReturn.keyboardConfig,
    actionMap,
  );

  const handleClick = useCallback(() => {
    propGetterReturn.onAction?.();
  }, [propGetterReturn.onAction]);

  return (
    <button
      type="button"
      {...ariaProps}
      className={cn("entropix-radio-item", className)}
      onClick={handleClick}
      onKeyDown={onKeyDown}
      data-state={isChecked ? "checked" : "unchecked"}
      data-disabled={disabled || undefined}
    >
      <span
        className="entropix-radio-item__indicator"
        data-state={isChecked ? "checked" : "unchecked"}
      />
      {(label || children) && (
        <span className="entropix-radio-item__label">
          {label || children}
        </span>
      )}
    </button>
  );
}
