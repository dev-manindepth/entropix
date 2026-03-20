import React, { useCallback } from "react";
import {
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import {
  useAccordionContext,
  useAccordionItemContext,
} from "./accordion-context.js";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";
import { useTheme } from "../../theme/theme-context.js";

export interface AccordionTriggerProps
  extends Omit<PressableProps, "onPress" | "style" | "children"> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
}

export function AccordionTrigger({
  children,
  style,
  textStyle,
  ...rest
}: AccordionTriggerProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const itemKey = useAccordionItemContext();
  const { getItemTriggerProps, isExpanded } = useAccordionContext();
  const propGetterReturn = getItemTriggerProps(itemKey);
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);
  const expanded = isExpanded(itemKey);

  const handlePress = useCallback(() => {
    propGetterReturn.onAction?.();
  }, [propGetterReturn.onAction]);

  return (
    <Pressable
      {...rnAccessibility}
      {...rest}
      onPress={propGetterReturn.onAction ? handlePress : undefined}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: bt.entropixSpacing4 as number,
          paddingHorizontal: bt.entropixSpacing4 as number,
        },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text
          style={[
            {
              fontSize: bt.entropixFontSizeSm as number,
              fontWeight: "500",
              color: t.entropixColorTextPrimary as string,
              flex: 1,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
      <Text
        style={{
          fontSize: 12,
          color: t.entropixColorTextSecondary as string,
          marginLeft: bt.entropixSpacing2 as number,
        }}
      >
        {expanded ? "−" : "+"}
      </Text>
    </Pressable>
  );
}
