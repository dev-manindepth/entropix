import React, { useCallback } from "react";
import { useMenuContext } from "./menu-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { useKeyboardHandler } from "../../utils/use-keyboard-handler.js";
import { cn } from "../../utils/cn.js";

export interface MenuTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function MenuTrigger({ children, className }: MenuTriggerProps) {
  const { getTriggerProps, toggle, open } = useMenuContext();
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
      {...ariaProps}
      className={cn("entropix-menu-trigger", className)}
      onClick={handleClick}
      onKeyDown={onKeyDown}
    >
      {children}
    </button>
  );
}
