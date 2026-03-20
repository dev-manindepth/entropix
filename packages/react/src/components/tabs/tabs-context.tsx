import { createContext, useContext } from "react";
import type { UseTabsReturn } from "@entropix/core";

export interface TabsContextValue extends UseTabsReturn {
  orientation: "horizontal" | "vertical";
  activationMode: "automatic" | "manual";
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(
      "Tabs compound components must be used within a <Tabs> provider.",
    );
  }
  return context;
}
