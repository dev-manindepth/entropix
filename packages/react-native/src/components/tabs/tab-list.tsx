import React from "react";
import { View, ScrollView, type ViewStyle, type StyleProp } from "react-native";
import { useTabsContext } from "./tabs-context.js";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";
import { useTheme } from "../../theme/theme-context.js";

export interface TabListProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Allow horizontal scrolling when tabs overflow. Default: true */
  scrollable?: boolean;
}

export function TabList({ children, style, scrollable = true }: TabListProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const { getTabListProps } = useTabsContext();
  const propGetterReturn = getTabListProps();
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);

  const innerStyle: ViewStyle = {
    flexDirection: "row",
    gap: bt.entropixSpacing1 as number,
    borderBottomWidth: 1,
    borderBottomColor: t.entropixColorBorderDefault as string,
  };

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[innerStyle, style]}
        {...rnAccessibility}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      {...rnAccessibility}
      style={[innerStyle, style]}
    >
      {children}
    </View>
  );
}
