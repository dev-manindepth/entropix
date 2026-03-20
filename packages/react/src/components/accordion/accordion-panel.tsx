import React from "react";
import {
  useAccordionContext,
  useAccordionItemContext,
} from "./accordion-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { cn } from "../../utils/cn.js";

export interface AccordionPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionPanel({ children, className }: AccordionPanelProps) {
  const itemKey = useAccordionItemContext();
  const { getItemPanelProps, isExpanded } = useAccordionContext();
  const propGetterReturn = getItemPanelProps(itemKey);
  const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);
  const panelId = propGetterReturn.accessibility.labelledBy
    ? String(propGetterReturn.accessibility.labelledBy).replace(
        "trigger-",
        "panel-",
      )
    : undefined;

  if (!isExpanded(itemKey)) return null;

  return (
    <div {...ariaProps} id={panelId} className={cn("entropix-accordion-panel", className)} data-state="open">
      {children}
    </div>
  );
}
