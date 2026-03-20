import React from "react";
import { useRadioGroup, type UseRadioGroupOptions } from "@entropix/core";
import { RadioContext } from "./radio-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { cn } from "../../utils/cn.js";
import "../../styles/radio.css";

export interface RadioGroupProps extends UseRadioGroupOptions {
  /** Label for the radio group */
  label?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * RadioGroup component — web adapter for @entropix/core's useRadioGroup.
 *
 * Renders a `<div role="radiogroup">` that provides context to RadioItem children.
 * Sets data-orientation for CSS targeting.
 */
export function RadioGroup({
  children,
  label,
  className,
  ...options
}: RadioGroupProps) {
  const radioGroup = useRadioGroup(options);
  const propGetterReturn = radioGroup.getRadioGroupProps();
  const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

  if (label) {
    ariaProps["aria-label"] = label;
  }

  return (
    <RadioContext.Provider value={radioGroup}>
      <div
        {...ariaProps}
        className={cn("entropix-radio-group", className)}
        data-orientation={options.orientation ?? "vertical"}
      >
        {children}
      </div>
    </RadioContext.Provider>
  );
}
