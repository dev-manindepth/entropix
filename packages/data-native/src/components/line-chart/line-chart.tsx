import React, { useMemo, useState, useCallback } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import SvgImport, { G, Path, Circle } from "react-native-svg";
const Svg = SvgImport as unknown as React.ComponentType<{ width: number; height: number; children?: React.ReactNode }>;
import { useTheme } from "@entropix/react-native";
import { useChartColors } from "../../utils/use-chart-colors.js";
import {
  normalizeChartData,
  getDataExtent,
  createLinearScale,
  createBandScale,
  computeLinePoints,
  describeLinePath,
  type ChartData,
  type TooltipData,
  type LegendItem,
  type ChartMargins,
} from "@entropix/core";
import { ChartContainer } from "../chart-primitives/chart-container.js";
import { XAxis } from "../chart-primitives/x-axis.js";
import { YAxis } from "../chart-primitives/y-axis.js";
import { ChartTooltip } from "../chart-primitives/chart-tooltip.js";
import { ChartLegend } from "../chart-primitives/chart-legend.js";

export interface LineChartProps {
  /** Chart data (single or multi-series) */
  data: ChartData;
  /** Chart height in pixels (default 300) */
  height?: number;
  /** Custom color palette */
  colors?: string[];
  /** Use curved lines (default false) */
  curved?: boolean;
  /** Show horizontal grid lines (default true) */
  showGrid?: boolean;
  /** Show data point circles (default true) */
  showPoints?: boolean;
  /** Show tooltip on point press (default true) */
  showTooltip?: boolean;
  /** Show legend below chart (default true) */
  showLegend?: boolean;
  /** Override wrapper View style */
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_MARGINS: ChartMargins = { top: 16, right: 16, bottom: 32, left: 48 };

export function LineChart({
  data,
  height = 300,
  colors,
  curved = false,
  showGrid = true,
  showPoints = true,
  showTooltip = true,
  showLegend = true,
  style,
}: LineChartProps) {
  const { tokens: st } = useTheme();
  const chartColors = useChartColors(colors);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const series = useMemo(
    () => normalizeChartData(data, chartColors),
    [data, chartColors],
  );

  const visibleSeries = useMemo(
    () => series.filter((s) => !hiddenSeries.has(s.name)),
    [series, hiddenSeries],
  );

  const legendItems: LegendItem[] = useMemo(
    () =>
      series.map((s) => ({
        name: s.name,
        color: s.color,
        active: !hiddenSeries.has(s.name),
      })),
    [series, hiddenSeries],
  );

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
      const { categories, yMin, yMax } = getDataExtent(visibleSeries);
      if (categories.length === 0) return null;

      const margins = DEFAULT_MARGINS;
      const innerWidth = containerWidth - margins.left - margins.right;
      const innerHeight = containerHeight - margins.top - margins.bottom;

      const xScale = createBandScale(categories, [0, innerWidth]);
      const yScale = createLinearScale([yMin, yMax], [innerHeight, 0]);

      return (
        <View style={{ flex: 1 }}>
          <Svg width={containerWidth} height={containerHeight}>
            <G x={margins.left} y={margins.top}>
              <YAxis
                scale={yScale}
                x={0}
                width={innerWidth}
                showGrid={showGrid}
              />
              <XAxis scale={xScale} y={innerHeight} />
              {visibleSeries.map((s, sIdx) => {
                const points = computeLinePoints(s, xScale, yScale);
                const pathD = describeLinePath(points, curved);

                return (
                  <G key={s.name}>
                    <Path
                      d={pathD}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {showPoints &&
                      points.map((pt, pIdx) => (
                        <Circle
                          key={`pt-${sIdx}-${pIdx}`}
                          cx={pt.x}
                          cy={pt.y}
                          r={4}
                          fill={s.color}
                          stroke={st.entropixColorSurfaceDefault as string}
                          strokeWidth={2}
                          onPress={
                            showTooltip
                              ? () => {
                                  setTooltip({
                                    x: margins.left + pt.x,
                                    y: margins.top + pt.y,
                                    series: s.name,
                                    label: pt.label,
                                    value: pt.value,
                                    color: s.color,
                                  });
                                }
                              : undefined
                          }
                        />
                      ))}
                  </G>
                );
              })}
            </G>
          </Svg>
          {showTooltip && <ChartTooltip data={tooltip} />}
        </View>
      );
    },
    [visibleSeries, curved, showGrid, showPoints, showTooltip, tooltip, st],
  );

  return (
    <View>
      <ChartContainer height={height} style={style}>
        {renderChart}
      </ChartContainer>
      {showLegend && series.length > 1 && (
        <ChartLegend items={legendItems} onToggle={handleLegendToggle} />
      )}
    </View>
  );
}
