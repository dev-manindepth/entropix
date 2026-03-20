import React, { useCallback } from "react";
import { useTabsContext } from "./tabs-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { useKeyboardHandler } from "../../utils/use-keyboard-handler.js";
import { cn } from "../../utils/cn.js";

export interface TabProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function Tab({ value, children, className }: TabProps) {
  const { getTabProps, select, selectedKey, orientation } = useTabsContext();
  const propGetterReturn = getTabProps(value);
  const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);
  const baseId = ariaProps["aria-controls"]
    ? String(ariaProps["aria-controls"]).replace(`-panel-${value}`, "")
    : "";

  const handleClick = useCallback(() => {
    propGetterReturn.onAction?.();
  }, [propGetterReturn.onAction]);

  const onKeyDown = useKeyboardHandler(propGetterReturn.keyboardConfig, {
    activate: () => select(value),
  });

  return (
    <button
      {...ariaProps}
      id={`${baseId}-tab-${value}`}
      className={cn("entropix-tab", className)}
      onClick={handleClick}
      onKeyDown={onKeyDown}
      data-state={selectedKey === value ? "active" : "inactive"}
      data-orientation={orientation}
    >
      {children}
    </button>
  );
}
