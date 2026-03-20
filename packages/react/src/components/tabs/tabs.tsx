import React from "react";
import { useTabs, type UseTabsOptions } from "@entropix/core";
import { TabsContext } from "./tabs-context.js";
import { cn } from "../../utils/cn.js";

export interface TabsProps extends UseTabsOptions {
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  children,
  className,
  orientation = "horizontal",
  activationMode = "automatic",
  ...options
}: TabsProps) {
  const tabs = useTabs({ ...options, orientation, activationMode });

  return (
    <TabsContext.Provider value={{ ...tabs, orientation, activationMode }}>
      <div className={cn("entropix-tabs", className)} data-orientation={orientation}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}
