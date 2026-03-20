import React from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../../theme/theme-context.js";

export type SpacingSize = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface StackProps extends ViewProps {
  /** Gap between children. Default uses space.layout.stack token (16px) */
  gap?: SpacingSize;
  /** Cross-axis alignment */
  align?: "start" | "center" | "end" | "stretch";
  /** Whether to take full width */
  fullWidth?: boolean;
  children?: React.ReactNode;
}

/**
 * Stack — vertical flex layout primitive for React Native.
 *
 * Uses the `space.layout.stack` token (16px) as default gap.
 *
 * ```tsx
 * <Stack gap="lg" align="center">
 *   <Button>First</Button>
 *   <Button>Second</Button>
 * </Stack>
 * ```
 */
export function Stack({
  gap,
  align,
  fullWidth,
  style,
  children,
  ...rest
}: StackProps) {
  const { baseTokens: bt } = useTheme();

  const gapValue = getGapValue(gap, bt);
  const alignMap: Record<string, ViewStyle["alignItems"]> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
  };

  return (
    <View
      style={[
        { flexDirection: "column" as const },
        gapValue !== undefined && { gap: gapValue },
        gapValue === undefined && { gap: bt.entropixSpaceLayoutStack as number },
        align && { alignItems: alignMap[align] },
        fullWidth && { width: "100%" },
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
