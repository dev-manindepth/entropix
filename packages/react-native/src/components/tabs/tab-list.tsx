import React from "react";
import { View, type ViewStyle, type StyleProp } from "react-native";
import { useTabsContext } from "./tabs-context.js";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";
import { useTheme } from "../../theme/theme-context.js";

export interface TabListProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function TabList({ children, style }: TabListProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const { getTabListProps } = useTabsContext();
  const propGetterReturn = getTabListProps();
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);

  return (
    <View
      {...rnAccessibility}
      style={[
        {
          flexDirection: "row",
          gap: bt.entropixSpacing1 as number,
          borderBottomWidth: 1,
          borderBottomColor: t.entropixColorBorderDefault as string,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
