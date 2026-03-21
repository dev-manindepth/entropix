import React, { useMemo, useState, useCallback } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import SvgImport, { G, Rect } from "react-native-svg";
const Svg = SvgImport as unknown as React.ComponentType<{ width: number; height: number; children?: React.ReactNode }>;
import { useTheme } from "@entropix/react-native";
import {
  normalizeChartData,
  getDataExtent,
  createLinearScale,
  createBandScale,
  computeBarGeometry,
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

export interface BarChartProps {
  /** Chart data (single or multi-series) */
  data: ChartData;
  /** Chart height in pixels (default 300) */
  height?: number;
  /** Custom color palette */
  colors?: string[];
  /** Stack bars instead of grouping (default false) */
  stacked?: boolean;
  /** Show horizontal grid lines (default true) */
  showGrid?: boolean;
  /** Show tooltip on bar press (default true) */
  showTooltip?: boolean;
  /** Show legend below chart (default true) */
  showLegend?: boolean;
  /** Override wrapper View style */
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_MARGINS: ChartMargins = { top: 16, right: 16, bottom: 32, left: 48 };

export function BarChart({
  data,
  height = 300,
  colors,
  stacked = false,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  style,
}: BarChartProps) {
  const { tokens: _st } = useTheme();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const series = useMemo(
    () => normalizeChartData(data, colors),
    [data, colors],
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
      const bars = computeBarGeometry(
        visibleSeries,
        xScale,
        yScale,
        innerHeight,
        stacked,
      );

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
              {bars.map((bar, i) => (
                <Rect
                  key={`bar-${i}`}
                  x={bar.x}
                  y={bar.y}
                  width={Math.max(0, bar.width)}
                  height={Math.max(0, bar.height)}
                  fill={bar.color}
                  rx={2}
                  onPress={
                    showTooltip
                      ? () => {
                          setTooltip({
                            x: margins.left + bar.x + bar.width / 2,
                            y: margins.top + bar.y,
                            series: visibleSeries[bar.seriesIndex]?.name ?? "",
                            label: bar.label,
                            value: bar.value,
                            color: bar.color,
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
    [visibleSeries, stacked, showGrid, showTooltip, tooltip],
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
