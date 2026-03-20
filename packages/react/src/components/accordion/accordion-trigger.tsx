import React, { useCallback } from "react";
import {
  useAccordionContext,
  useAccordionItemContext,
} from "./accordion-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { useKeyboardHandler } from "../../utils/use-keyboard-handler.js";
import { cn } from "../../utils/cn.js";

export interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionTrigger({
  children,
  className,
}: AccordionTriggerProps) {
  const itemKey = useAccordionItemContext();
  const { getItemTriggerProps, toggle } = useAccordionContext();
  const propGetterReturn = getItemTriggerProps(itemKey);
  const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);
  const triggerId = propGetterReturn.accessibility.controls
    ? String(propGetterReturn.accessibility.controls).replace("panel-", "trigger-")
    : undefined;

  const handleClick = useCallback(() => {
    propGetterReturn.onAction?.();
  }, [propGetterReturn.onAction]);

  const onKeyDown = useKeyboardHandler(propGetterReturn.keyboardConfig, {
    activate: () => toggle(itemKey),
  });

  return (
    <button
      {...ariaProps}
      id={triggerId}
      className={cn("entropix-accordion-trigger", className)}
      onClick={handleClick}
      onKeyDown={onKeyDown}
    >
      {children}
    </button>
  );
}
