import React from "react";
import { useSelectContext } from "./select-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { useKeyboardHandler } from "../../utils/use-keyboard-handler.js";
import { cn } from "../../utils/cn.js";

export interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * SelectContent — renders the dropdown container for options.
 *
 * Only visible when the select is open.
 */
export function SelectContent({ children, className }: SelectContentProps) {
  const { isOpen, getListboxProps, close } = useSelectContext();
  const propGetterReturn = getListboxProps();
  const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

  const onKeyDown = useKeyboardHandler(propGetterReturn.keyboardConfig, {
    dismiss: close,
  });

  if (!isOpen) return null;

  return (
    <div
      {...ariaProps}
      className={cn("entropix-select-content", className)}
      onKeyDown={onKeyDown}
      data-state="open"
    >
      {children}
    </div>
  );
}
