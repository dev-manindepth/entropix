import React from "react";
import { View, type ViewStyle, type StyleProp } from "react-native";
import { useTabs, type UseTabsOptions } from "@entropix/core";
import { TabsContext } from "./tabs-context.js";

export interface TabsProps extends UseTabsOptions {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Tabs({ children, style, ...options }: TabsProps) {
  const tabs = useTabs(options);

  return (
    <TabsContext.Provider value={tabs}>
      <View style={style}>{children}</View>
    </TabsContext.Provider>
  );
}
