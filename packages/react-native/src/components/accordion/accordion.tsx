import React from "react";
import { View, type ViewStyle, type StyleProp } from "react-native";
import { useAccordion, type UseAccordionOptions } from "@entropix/core";
import { AccordionContext } from "./accordion-context.js";
import { useTheme } from "../../theme/theme-context.js";

export interface AccordionProps extends UseAccordionOptions {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Accordion({ children, style, ...options }: AccordionProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const accordion = useAccordion(options);

  return (
    <AccordionContext.Provider value={accordion}>
      <View
        style={[
          {
            borderWidth: 1,
            borderColor: t.entropixColorBorderDefault as string,
            borderRadius: bt.entropixRadiusLg as number,
            overflow: "hidden",
          },
          style,
        ]}
      >
        {children}
      </View>
    </AccordionContext.Provider>
  );
}
