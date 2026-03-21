import { useMemo } from "react";
import { useTheme } from "@entropix/react-native";
import { DEFAULT_CHART_COLORS } from "@entropix/core";

/**
 * Returns a theme-aware chart color palette.
 * The first color is the brand's primary action color (e.g. teal for Ocean, orange for Sunset).
 * Remaining colors use the default palette but skip any that are too close to the primary.
 *
 * If custom colors are provided, they are returned as-is.
 */
export function useChartColors(customColors?: string[]): string[] {
  const { tokens } = useTheme();

  return useMemo(() => {
    if (customColors) return customColors;

    const primaryColor = tokens.entropixColorActionPrimaryDefault as string;
    // Use brand primary as first color, then remaining defaults
    return [
      primaryColor,
      ...DEFAULT_CHART_COLORS.slice(1),
    ];
  }, [customColors, tokens.entropixColorActionPrimaryDefault]);
}
