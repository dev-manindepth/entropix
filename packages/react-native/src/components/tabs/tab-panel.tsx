import React from "react";
import { View, type ViewStyle, type StyleProp } from "react-native";
import { useTabsContext } from "./tabs-context.js";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";
import { useTheme } from "../../theme/theme-context.js";

export interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function TabPanel({ value, children, style }: TabPanelProps) {
  const { baseTokens: bt } = useTheme();
  const { getTabPanelProps, selectedKey } = useTabsContext();
  const propGetterReturn = getTabPanelProps(value);
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);

  if (selectedKey !== value) return null;

  return (
    <View
      {...rnAccessibility}
      style={[{ padding: bt.entropixSpacing4 as number }, style]}
    >
      {children}
    </View>
  );
}
