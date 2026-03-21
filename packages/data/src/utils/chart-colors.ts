/**
 * CSS custom property palette for web charts.
 * These reference --chart-series-N variables defined in chart.css,
 * which in turn resolve to brand/theme-aware design tokens.
 *
 * The first color maps to --entropix-color-action-primary-default,
 * so charts automatically adapt to the active brand.
 */
export const CSS_CHART_COLORS = [
  "var(--chart-series-1)",
  "var(--chart-series-2)",
  "var(--chart-series-3)",
  "var(--chart-series-4)",
  "var(--chart-series-5)",
  "var(--chart-series-6)",
  "var(--chart-series-7)",
  "var(--chart-series-8)",
];
