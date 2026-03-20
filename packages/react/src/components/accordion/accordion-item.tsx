import React from "react";
import {
  AccordionItemContext,
  useAccordionContext,
} from "./accordion-context.js";
import { cn } from "../../utils/cn.js";

export interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionItem({
  value,
  children,
  className,
}: AccordionItemProps) {
  const { isExpanded } = useAccordionContext();

  return (
    <AccordionItemContext.Provider value={value}>
      <div
        className={cn("entropix-accordion-item", className)}
        data-state={isExpanded(value) ? "open" : "closed"}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}
