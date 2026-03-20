import React from "react";
import { View, type ViewStyle, type StyleProp } from "react-native";
import {
  useAccordionContext,
  useAccordionItemContext,
} from "./accordion-context.js";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";
import { useTheme } from "../../theme/theme-context.js";

export interface AccordionPanelProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AccordionPanel({ children, style }: AccordionPanelProps) {
  const { baseTokens: bt } = useTheme();
  const itemKey = useAccordionItemContext();
  const { getItemPanelProps, isExpanded } = useAccordionContext();
  const propGetterReturn = getItemPanelProps(itemKey);
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);

  if (!isExpanded(itemKey)) return null;

  return (
    <View
      {...rnAccessibility}
      style={[
        {
          paddingHorizontal: bt.entropixSpacing4 as number,
          paddingBottom: bt.entropixSpacing4 as number,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
