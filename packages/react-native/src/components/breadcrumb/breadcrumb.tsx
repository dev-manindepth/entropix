import React from "react";
import {
  View,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../../theme/theme-context.js";
import { useLocale } from "../../i18n/i18n-context.js";

export interface BreadcrumbProps {
  /** Separator character between items. Default: "/" */
  separator?: string;
  /** Override container style */
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  /** testID for testing */
  testID?: string;
}

/**
 * Breadcrumb — horizontal navigation component.
 *
 * Renders children in a row with separator characters between items.
 * Uses flexWrap to handle overflow gracefully.
 */
export function Breadcrumb({
  separator = "/",
  style,
  children,
  testID,
}: BreadcrumbProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const locale = useLocale();

  const childArray = React.Children.toArray(children).filter(Boolean);

  return (
    <View
      style={[
        {
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          gap: bt.entropixSpacing2 as number,
        },
        style,
      ]}
      testID={testID}
      accessibilityRole="none"
      accessibilityLabel={locale.breadcrumb_label}
    >
      {childArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < childArray.length - 1 ? (
            <Text
              style={{
                fontSize: bt.entropixFontSizeSm as number,
                color: t.entropixColorTextTertiary as string,
              }}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              {separator}
            </Text>
          ) : null}
        </React.Fragment>
      ))}
    </View>
  );
}
