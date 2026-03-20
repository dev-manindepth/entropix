import React, { useCallback } from "react";
import { useMenuContext } from "./menu-context.js";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import { cn } from "../../utils/cn.js";

export interface MenuItemProps {
  index: number;
  onSelect?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function MenuItem({
  index,
  onSelect,
  disabled,
  children,
  className,
}: MenuItemProps) {
  const { getItemProps, activeIndex } = useMenuContext();
  const propGetterReturn = getItemProps(index, { onSelect, disabled });
  const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

  const handleClick = useCallback(() => {
    propGetterReturn.onAction?.();
  }, [propGetterReturn.onAction]);

  return (
    <div
      {...ariaProps}
      className={cn("entropix-menu-item", className)}
      onClick={handleClick}
      data-state={activeIndex === index ? "active" : "inactive"}
      data-disabled={disabled || undefined}
    >
      {children}
    </div>
  );
}
