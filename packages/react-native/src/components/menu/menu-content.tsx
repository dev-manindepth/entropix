import React from "react";
import { View, type ViewStyle, type StyleProp } from "react-native";
import { useMenuContext } from "./menu-context.js";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";
import { useTheme } from "../../theme/theme-context.js";

export interface MenuContentProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function MenuContent({ children, style, testID }: MenuContentProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const { isOpen, getMenuProps } = useMenuContext();
  const propGetterReturn = getMenuProps();
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);

  if (!isOpen) return null;

  return (
    <View
      {...rnAccessibility}
      testID={testID}
      style={[
        {
          minWidth: 160,
          padding: bt.entropixSpacing1 as number,
          backgroundColor: t.entropixColorBgPrimary as string,
          borderWidth: 1,
          borderColor: t.entropixColorBorderDefault as string,
          borderRadius: bt.entropixRadiusMd as number,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
