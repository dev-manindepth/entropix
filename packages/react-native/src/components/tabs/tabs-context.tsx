import { createContext, useContext } from "react";
import type { UseTabsReturn } from "@entropix/core";

export const TabsContext = createContext<UseTabsReturn | null>(null);

export function useTabsContext(): UseTabsReturn {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(
      "Tabs compound components must be used within a <Tabs> provider.",
    );
  }
  return context;
}
