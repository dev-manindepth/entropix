import React from "react";
import {
  Text,
  Pressable,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { useTheme } from "../../theme/theme-context.js";

export interface BreadcrumbItemProps {
  /** Called when the item is pressed. If absent, renders as plain text (current page). */
  onPress?: () => void;
  /** Override container style */
  style?: StyleProp<ViewStyle>;
  /** Override text style */
  textStyle?: TextStyle;
  children: React.ReactNode;
  /** testID for testing */
  testID?: string;
}

/**
 * BreadcrumbItem — individual breadcrumb entry.
 *
 * If onPress is provided: renders as a Pressable with link-style text.
 * If no onPress (last/current item): renders as bold Text.
 */
export function BreadcrumbItem({
  onPress,
  style,
  textStyle,
  children,
  testID,
}: BreadcrumbItemProps) {
  const { tokens: t, baseTokens: bt } = useTheme();

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={style}
        testID={testID}
        accessibilityRole="link"
      >
        <Text
          style={[
            {
              fontSize: bt.entropixFontSizeSm as number,
              color: t.entropixColorTextLink as string,
              textDecorationLine: "underline",
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      </Pressable>
    );
  }

  return (
    <Text
      style={[
        {
          fontSize: bt.entropixFontSizeSm as number,
          fontWeight: "600",
          color: t.entropixColorTextPrimary as string,
        },
        textStyle,
        style as TextStyle,
      ]}
      testID={testID}
      accessibilityRole="text"
    >
      {children}
    </Text>
  );
}
