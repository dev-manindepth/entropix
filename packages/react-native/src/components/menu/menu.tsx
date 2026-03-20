import React from "react";
import { useMenu, type UseMenuOptions } from "@entropix/core";
import { MenuContext } from "./menu-context.js";

export interface MenuProps extends UseMenuOptions {
  children: React.ReactNode;
}

export function Menu({ children, ...options }: MenuProps) {
  const menu = useMenu(options);

  return (
    <MenuContext.Provider value={menu}>{children}</MenuContext.Provider>
  );
}
