import type {
  ChartData,
  ChartDataPoint,
  ChartSeries,
  NormalizedSeries,
} from "../../types/chart.js";
import { getSeriesColor } from "./colors.js";

/**
 * Checks if data is a single-series shorthand (ChartDataPoint[]).
 */
function isSingleSeries(data: ChartData): data is ChartDataPoint[] {
  return data.length > 0 && "label" in data[0]! && "value" in data[0]!;
}

/**
 * Normalize flexible chart data input into a uniform array of NormalizedSeries.
 */
export function normalizeChartData(
  data: ChartData,
  customColors?: string[],
): NormalizedSeries[] {
  if (data.length === 0) return [];

  if (isSingleSeries(data)) {
    return [
      {
        name: "Series 1",
        data: data.map((d) => ({ label: d.label, value: d.value })),
        color: getSeriesColor(0, customColors),
      },
    ];
  }

  return (data as ChartSeries[]).map((series, i) => ({
    name: series.name,
    data: series.data.map((d) => ({ label: d.label, value: d.value })),
    color: series.color ?? getSeriesColor(i, customColors),
  }));
}

/**
 * Compute the data extent (categories and value range) across all series.
 */
export function getDataExtent(series: NormalizedSeries[]): {
  categories: string[];
  yMin: number;
  yMax: number;
} {
  if (series.length === 0) {
    return { categories: [], yMin: 0, yMax: 0 };
  }

  const categorySet = new Set<string>();
  let yMin = Infinity;
  let yMax = -Infinity;

  for (const s of series) {
    for (const d of s.data) {
      categorySet.add(d.label);
      if (d.value < yMin) yMin = d.value;
      if (d.value > yMax) yMax = d.value;
    }
  }

  // Always include 0 in the range for bar charts
  if (yMin > 0) yMin = 0;

  return {
    categories: Array.from(categorySet),
    yMin,
    yMax,
  };
}
