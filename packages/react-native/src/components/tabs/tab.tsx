import React, { useCallback } from "react";
import {
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { useTabsContext } from "./tabs-context.js";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";
import { useTheme } from "../../theme/theme-context.js";

export interface TabProps extends Omit<PressableProps, "onPress" | "style" | "children"> {
  value: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
}

export function Tab({ value, children, style, textStyle, ...rest }: TabProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const { getTabProps, selectedKey } = useTabsContext();
  const propGetterReturn = getTabProps(value);
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);
  const isActive = selectedKey === value;
  const isDisabled = propGetterReturn.accessibility.disabled === true;

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
          paddingVertical: bt.entropixSpacing2 as number,
          paddingHorizontal: bt.entropixSpacing4 as number,
          borderBottomWidth: 2,
          borderBottomColor: isActive
            ? (t.entropixColorActionPrimaryDefault as string)
            : "transparent",
        },
        isDisabled && { opacity: 0.5 },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text
          style={[
            {
              fontSize: bt.entropixFontSizeSm as number,
              fontWeight: "500",
              color: isActive
                ? (t.entropixColorActionPrimaryDefault as string)
                : (t.entropixColorTextSecondary as string),
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
