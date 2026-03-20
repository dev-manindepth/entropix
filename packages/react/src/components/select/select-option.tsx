import React, { useCallback } from "react";
import { useSelectContext } from "./select-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { cn } from "../../utils/cn.js";

export interface SelectOptionProps {
  /** The value this option represents */
  value: string;
  /** The index of this option in the list (auto-assigned by SelectContent if omitted) */
  index?: number;
  /** Whether this option is disabled */
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * SelectOption — renders an option within SelectContent.
 *
 * Sets data-state="selected"|"unselected" for CSS targeting.
 */
export function SelectOption({
  value,
  index,
  disabled,
  children,
  className,
}: SelectOptionProps) {
  const { getOptionProps, selectedValue } = useSelectContext();
  const propGetterReturn = getOptionProps(value, index ?? 0, { disabled });
  const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

  const isSelected = value === selectedValue;

  const handleClick = useCallback(() => {
    propGetterReturn.onAction?.();
  }, [propGetterReturn.onAction]);

  return (
    <div
      {...ariaProps}
      className={cn("entropix-select-option", className)}
      onClick={handleClick}
      data-state={isSelected ? "selected" : "unselected"}
      data-disabled={disabled || undefined}
    >
      {children}
    </div>
  );
}
