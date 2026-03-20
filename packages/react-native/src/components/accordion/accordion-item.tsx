import React from "react";
import { View, type ViewStyle, type StyleProp } from "react-native";
import { AccordionItemContext } from "./accordion-context.js";
import { useTheme } from "../../theme/theme-context.js";

export interface AccordionItemProps {
  value: string;
  /** Whether this is the last item (hides bottom border). Auto-detected if omitted. */
  isLast?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AccordionItem({
  value,
  isLast = false,
  children,
  style,
}: AccordionItemProps) {
  const { tokens: t } = useTheme();

  return (
    <AccordionItemContext.Provider value={value}>
      <View
        style={[
          {
            borderBottomWidth: isLast ? 0 : 1,
            borderBottomColor: t.entropixColorBorderDefault as string,
          },
          style,
        ]}
      >
        {children}
      </View>
    </AccordionItemContext.Provider>
  );
}
