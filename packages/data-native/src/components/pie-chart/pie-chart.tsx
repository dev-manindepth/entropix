import React, { useMemo, useState, useCallback } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import SvgImport, { G, Path } from "react-native-svg";
const Svg = SvgImport as unknown as React.ComponentType<{ width: number; height: number; children?: React.ReactNode }>;
import { useTheme } from "@entropix/react-native";
import { useChartColors } from "../../utils/use-chart-colors.js";
import {
  normalizeChartData,
  computeArcGeometry,
  getSeriesColor,
  type ChartData,
  type TooltipData,
  type LegendItem,
} from "@entropix/core";
import { ChartContainer } from "../chart-primitives/chart-container.js";
import { ChartTooltip } from "../chart-primitives/chart-tooltip.js";
import { ChartLegend } from "../chart-primitives/chart-legend.js";

export interface PieChartProps {
  /** Chart data (single series only -- uses label/value pairs) */
  data: ChartData;
  /** Chart height in pixels (default 300) */
  height?: number;
  /** Custom color palette */
  colors?: string[];
  /** Inner radius ratio for donut chart (0 = pie, 0.5 = donut). Default 0 */
  innerRadiusRatio?: number;
  /** Show tooltip on slice press (default true) */
  showTooltip?: boolean;
  /** Show legend below chart (default true) */
  showLegend?: boolean;
  /** Override wrapper View style */
  style?: StyleProp<ViewStyle>;
}

export function PieChart({
  data,
  height = 300,
  colors,
  innerRadiusRatio = 0,
  showTooltip = true,
  showLegend = true,
  style,
}: PieChartProps) {
  const { tokens: st } = useTheme();
  const chartColors = useChartColors(colors);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const series = useMemo(
    () => normalizeChartData(data, chartColors),
    [data, chartColors],
  );

  // For pie chart, flatten all series data points into slice data
  const sliceData = useMemo(() => {
    const items: { label: string; value: number; color: string; seriesName: string }[] = [];
    for (const s of series) {
      for (const d of s.data) {
        if (!hiddenSeries.has(d.label)) {
          items.push({
            label: d.label,
            value: d.value,
            color: s.color,
            seriesName: s.name,
          });
        }
      }
    }
    return items;
  }, [series, hiddenSeries]);

  // Build legend items from slices (each label is a legend item)
  const legendItems: LegendItem[] = useMemo(() => {
    const allItems: { label: string; value: number; color: string }[] = [];
    for (const s of series) {
      for (const d of s.data) {
        allItems.push({ label: d.label, value: d.value, color: s.color });
      }
    }
    // For single-series pie charts, each data point gets its own color from palette
    if (series.length === 1) {
      return allItems.map((item, i) => ({
        name: item.label,
        color: getSeriesColor(i, chartColors),
        active: !hiddenSeries.has(item.label),
      }));
    }
    // Multi-series: use series-level colors
    return series.map((s) => ({
      name: s.name,
      color: s.color,
      active: !hiddenSeries.has(s.name),
    }));
  }, [series, chartColors, hiddenSeries]);

  const handleLegendToggle = useCallback((name: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  const renderChart = useCallback(
    (containerWidth: number, containerHeight: number) => {
      const cx = containerWidth / 2;
      const cy = containerHeight / 2;
      const outerRadius = Math.min(cx, cy) - 16;

      if (outerRadius <= 0 || sliceData.length === 0) return null;

      // For single-series, each data point gets unique color from palette
      let arcData: { label: string; value: number; color: string }[];
      if (series.length === 1) {
        arcData = sliceData.map((d, i) => ({
          label: d.label,
          value: d.value,
          color: getSeriesColor(i, chartColors),
        }));
      } else {
        arcData = sliceData.map((d) => ({
          label: d.label,
          value: d.value,
          color: d.color,
        }));
      }

      const arcs = computeArcGeometry(arcData, outerRadius, innerRadiusRatio);

      return (
        <View style={{ flex: 1 }}>
          <Svg width={containerWidth} height={containerHeight}>
            <G x={cx} y={cy}>
              {arcs.map((arc, i) => (
                <Path
                  key={`arc-${i}`}
                  d={arc.path}
                  fill={arc.color}
                  stroke={st.entropixColorSurfaceDefault as string}
                  strokeWidth={1}
                  onPress={
                    showTooltip
                      ? () => {
                          // Position tooltip near the middle of the arc
                          const midAngle = (arc.startAngle + arc.endAngle) / 2;
                          const midRadius = outerRadius * 0.6;
                          const tx = cx + midRadius * Math.cos(midAngle);
                          const ty = cy + midRadius * Math.sin(midAngle);
                          setTooltip({
                            x: tx,
                            y: ty,
                            series: arc.label,
                            label: arc.label,
                            value: arc.value,
                            color: arc.color,
                          });
                        }
                      : undefined
                  }
                />
              ))}
            </G>
          </Svg>
          {showTooltip && <ChartTooltip data={tooltip} />}
        </View>
      );
    },
    [sliceData, series, colors, innerRadiusRatio, showTooltip, tooltip, st],
  );

  return (
    <View>
      <ChartContainer height={height} style={style}>
        {renderChart}
      </ChartContainer>
      {showLegend && legendItems.length > 1 && (
        <ChartLegend items={legendItems} onToggle={handleLegendToggle} />
      )}
    </View>
  );
}
