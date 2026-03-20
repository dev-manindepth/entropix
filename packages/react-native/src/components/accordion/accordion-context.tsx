import { createContext, useContext } from "react";
import type { UseAccordionReturn } from "@entropix/core";

export const AccordionContext = createContext<UseAccordionReturn | null>(null);

export function useAccordionContext(): UseAccordionReturn {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(
      "Accordion compound components must be used within an <Accordion> provider.",
    );
  }
  return context;
}

export const AccordionItemContext = createContext<string | null>(null);

export function useAccordionItemContext(): string {
  const context = useContext(AccordionItemContext);
  if (context === null) {
    throw new Error(
      "AccordionTrigger and AccordionPanel must be used within an <AccordionItem>.",
    );
  }
  return context;
}
