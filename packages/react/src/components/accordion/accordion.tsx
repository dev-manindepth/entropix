import React from "react";
import { useAccordion, type UseAccordionOptions } from "@entropix/core";
import { AccordionContext } from "./accordion-context.js";
import { cn } from "../../utils/cn.js";
import "../../styles/accordion.css";

export interface AccordionProps extends UseAccordionOptions {
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ children, className, ...options }: AccordionProps) {
  const accordion = useAccordion(options);

  return (
    <AccordionContext.Provider value={accordion}>
      <div className={cn("entropix-accordion", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}
