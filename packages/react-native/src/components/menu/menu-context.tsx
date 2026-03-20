import { createContext, useContext } from "react";
import type { UseMenuReturn } from "@entropix/core";

export const MenuContext = createContext<UseMenuReturn | null>(null);

export function useMenuContext(): UseMenuReturn {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error(
      "Menu compound components must be used within a <Menu> provider.",
    );
  }
  return context;
}
