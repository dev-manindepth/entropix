import React from "react";
import { useMenuContext } from "./menu-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { useKeyboardHandler } from "../../utils/use-keyboard-handler.js";
import { cn } from "../../utils/cn.js";
import "../../styles/menu.css";

export interface MenuContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MenuContent({ children, className }: MenuContentProps) {
  const { isOpen, getMenuProps, close } = useMenuContext();
  const propGetterReturn = getMenuProps();
  const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

  const onKeyDown = useKeyboardHandler(propGetterReturn.keyboardConfig, {
    dismiss: close,
  });

  if (!isOpen) return null;

  return (
    <div
      {...ariaProps}
      className={cn("entropix-menu-content", className)}
      onKeyDown={onKeyDown}
      data-state="open"
    >
      {children}
    </div>
  );
}
