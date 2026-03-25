import React, { useCallback } from "react";
import { useSelectContext } from "./select-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { useKeyboardHandler } from "../../utils/use-keyboard-handler.js";
import { cn } from "../../utils/cn.js";
import { useLocale } from "../../i18n/i18n-context.js";

export interface SelectTriggerProps {
  /** Placeholder text when no value is selected */
  placeholder?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * SelectTrigger — renders like a styled input with a chevron.
 *
 * Displays the currently selected value or placeholder text.
 */
export function SelectTrigger({
  placeholder,
  children,
  className,
}: SelectTriggerProps) {
  const locale = useLocale();
  const { getTriggerProps, toggle, open, selectedValue, isDisabled } =
    useSelectContext();
  const propGetterReturn = getTriggerProps();
  const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

  const handleClick = useCallback(() => {
    propGetterReturn.onAction?.();
  }, [propGetterReturn.onAction]);

  const onKeyDown = useKeyboardHandler(propGetterReturn.keyboardConfig, {
    activate: toggle,
    moveDown: open,
    moveUp: open,
  });

  return (
    <button
      type="button"
      {...ariaProps}
      className={cn("entropix-select-trigger", className)}
      onClick={handleClick}
      onKeyDown={onKeyDown}
      disabled={isDisabled || undefined}
    >
      <span className="entropix-select-trigger__value">
        {children ?? (selectedValue || (placeholder ?? locale.select_placeholder))}
      </span>
      <span className="entropix-select-trigger__chevron" aria-hidden="true">
        &#9662;
      </span>
    </button>
  );
}
