import React from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../../theme/theme-context.js";

export type SpacingSize = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface InlineProps extends ViewProps {
  /** Gap between children. Default uses space.layout.inline token (12px) */
  gap?: SpacingSize;
  /** Cross-axis alignment */
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  /** Main-axis justification */
  justify?: "start" | "center" | "end" | "between" | "around";
  /** Whether to wrap children */
  wrap?: boolean;
  children?: React.ReactNode;
}

/**
 * Inline — horizontal flex layout primitive for React Native.
 *
 * Uses the `space.layout.inline` token (12px) as default gap.
 *
 * ```tsx
 * <Inline gap="sm" justify="between" wrap>
 *   <Button variant="primary">Save</Button>
 *   <Button variant="ghost">Cancel</Button>
 * </Inline>
 * ```
 */
export function Inline({
  gap,
  align,
  justify,
  wrap,
  style,
  children,
  ...rest
}: InlineProps) {
  const { baseTokens: bt } = useTheme();

  const gapValue = getGapValue(gap, bt);
  const alignMap: Record<string, ViewStyle["alignItems"]> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
    baseline: "baseline",
  };
  const justifyMap: Record<string, ViewStyle["justifyContent"]> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    between: "space-between",
    around: "space-around",
  };

  return (
    <View
      style={[
        {
          flexDirection: "row" as const,
          alignItems: "center" as const,
        },
        gapValue !== undefined && { gap: gapValue },
        gapValue === undefined && { gap: bt.entropixSpaceLayoutInline as number },
        align && { alignItems: alignMap[align] },
        justify && { justifyContent: justifyMap[justify] },
        wrap && { flexWrap: "wrap" as const },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

function getGapValue(
  gap: SpacingSize | undefined,
  bt: Record<string, unknown>,
): number | undefined {
  if (!gap) return undefined;
  switch (gap) {
    case "none": return 0;
    case "xs":   return bt.entropixSpacing1 as number;
    case "sm":   return bt.entropixSpacing2 as number;
    case "md":   return bt.entropixSpacing4 as number;
    case "lg":   return bt.entropixSpacing6 as number;
    case "xl":   return bt.entropixSpacing8 as number;
    case "2xl":  return bt.entropixSpacing12 as number;
  }
}
