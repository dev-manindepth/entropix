import React from "react";
import { useTabsContext } from "./tabs-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { cn } from "../../utils/cn.js";

export interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { getTabPanelProps, selectedKey } = useTabsContext();
  const propGetterReturn = getTabPanelProps(value);
  const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);
  const baseId = ariaProps["aria-labelledby"]
    ? String(ariaProps["aria-labelledby"]).replace(`-tab-${value}`, "")
    : "";

  if (selectedKey !== value) return null;

  return (
    <div
      {...ariaProps}
      id={`${baseId}-panel-${value}`}
      className={cn("entropix-tabpanel", className)}
      data-state="active"
    >
      {children}
    </div>
  );
}
