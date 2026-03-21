/** Default chart series color palette */
export const DEFAULT_CHART_COLORS = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#22c55e", // green-500
  "#f59e0b", // amber-500
  "#a855f7", // purple-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#ec4899", // pink-500
];

/**
 * Get a color for a series by index, cycling through the palette.
 */
export function getSeriesColor(
  index: number,
  customColors?: string[],
): string {
  const palette = customColors ?? DEFAULT_CHART_COLORS;
  return palette[index % palette.length]!;
}
