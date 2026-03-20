import React from "react";
import { useTabsContext } from "./tabs-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { cn } from "../../utils/cn.js";
import "../../styles/tabs.css";

export interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  const { getTabListProps } = useTabsContext();
  const propGetterReturn = getTabListProps();
  const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

  return (
    <div {...ariaProps} className={cn("entropix-tablist", className)}>
      {children}
    </div>
  );
}
