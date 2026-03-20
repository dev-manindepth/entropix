import React from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../../theme/theme-context.js";

export interface DividerProps extends ViewProps {
  /** Orientation of the divider */
  orientation?: "horizontal" | "vertical";
  /** Spacing above and below (or left and right for vertical) */
  spacing?: "sm" | "md" | "lg";
}

/**
 * Divider — visual separator line for React Native.
 *
 * Uses the `color.border.default` token for line color.
 *
 * ```tsx
 * <Stack>
 *   <Text>Section A</Text>
 *   <Divider spacing="md" />
 *   <Text>Section B</Text>
 * </Stack>
 *
 * <Inline>
 *   <Text>Left</Text>
 *   <Divider orientation="vertical" spacing="sm" />
 *   <Text>Right</Text>
 * </Inline>
 * ```
 */
export function Divider({
  orientation = "horizontal",
  spacing,
  style,
  ...rest
}: DividerProps) {
  const { tokens: t, baseTokens: bt } = useTheme();

  const spacingMap: Record<string, number> = {
    sm: bt.entropixSpacing2 as number,
    md: bt.entropixSpacing4 as number,
    lg: bt.entropixSpacing6 as number,
  };

  const spacingValue = spacing ? spacingMap[spacing] : 0;

  const isVertical = orientation === "vertical";

  const dividerStyle: ViewStyle = isVertical
    ? {
        width: 1,
        alignSelf: "stretch",
        backgroundColor: t.entropixColorBorderDefault as string,
        marginHorizontal: spacingValue,
      }
    : {
        height: 1,
        width: "100%",
        backgroundColor: t.entropixColorBorderDefault as string,
        marginVertical: spacingValue,
      };

  return (
    <View
      accessibilityRole={isVertical ? "none" : undefined}
      style={[dividerStyle, style]}
      {...rest}
    />
  );
}
