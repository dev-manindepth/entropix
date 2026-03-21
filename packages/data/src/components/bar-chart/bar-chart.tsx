import React, { useState, useRef, useCallback } from "react";
import type {
  ChartData,
  AxisConfig,
  TooltipData,
  LegendItem,
  BarRect,
} from "@entropix/core";
import {
  normalizeChartData,
  getDataExtent,
  niceBounds,
  createLinearScale,
  createBandScale,
  computeBarGeometry,
} from "@entropix/core";
import { ChartContainer } from "../chart-primitives/chart-container.js";
import { XAxis } from "../chart-primitives/x-axis.js";
import { YAxis } from "../chart-primitives/y-axis.js";
import { ChartTooltip } from "../chart-primitives/chart-tooltip.js";
import { ChartLegend } from "../chart-primitives/chart-legend.js";
import { CSS_CHART_COLORS } from "../../utils/chart-colors.js";
import "../../styles/chart.css";

export interface BarChartProps {
  data: ChartData;
  height?: number;
  colors?: string[];
  stacked?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  className?: string;
}

const MARGINS = { top: 20, right: 20, bottom: 40, left: 50 };

export function BarChart({
  data,
  height = 300,
  colors,
  stacked = false,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  xAxis,
  yAxis,
  className,
}: BarChartProps) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleSeries = useCallback((name: string) => {
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

  const allSeries = normalizeChartData(data, colors ?? CSS_CHART_COLORS);
  const visibleSeries = allSeries.filter((s) => !hiddenSeries.has(s.name));
  const { categories, yMin, yMax } = getDataExtent(visibleSeries);

  const legendItems: LegendItem[] = allSeries.map((s) => ({
    name: s.name,
    color: s.color,
    active: !hiddenSeries.has(s.name),
  }));

  const handleBarEnter = useCallback(
    (rect: BarRect, seriesName: string, event: React.MouseEvent) => {
      if (!showTooltip) return;
      const svg = (event.target as Element).closest("svg");
      if (!svg) return;
      const _pt = svg.getBoundingClientRect();
      const container = containerRef.current;
      if (!container) return;
      const _containerRect = container.getBoundingClientRect();

      setTooltip({
        x: rect.x + rect.width / 2 + MARGINS.left,
        y: rect.y + MARGINS.top,
        series: seriesName,
        label: rect.label,
        value: rect.value,
        color: rect.color,
      });
    },
    [showTooltip],
  );

  const handleBarLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <div ref={containerRef} className={className ? `entropix-chart ${className}` : "entropix-chart"} style={{ position: "relative" }}>
      <ChartContainer height={height}>
        {(width, h) => {
          const innerWidth = width - MARGINS.left - MARGINS.right;
          const innerHeight = h - MARGINS.top - MARGINS.bottom;

          if (innerWidth <= 0 || innerHeight <= 0) return null;

          const bounds = niceBounds(yMin, yMax, yAxis?.tickCount ?? 5);
          const yScale = createLinearScale(
            [bounds.min, bounds.max],
            [innerHeight, 0],
          );
          const xScale = createBandScale(categories, [0, innerWidth]);

          const bars = computeBarGeometry(
            visibleSeries,
            xScale,
            yScale,
            innerHeight,
            stacked,
          );

          return (
            <g transform={`translate(${MARGINS.left}, ${MARGINS.top})`}>
              {(yAxis?.show !== false) && (
                <YAxis
                  scale={yScale}
                  x={0}
                  width={innerWidth}
                  showGrid={showGrid}
                  formatter={yAxis?.formatter as ((v: number) => string) | undefined}
                />
              )}
              {(xAxis?.show !== false) && (
                <XAxis
                  scale={xScale}
                  y={innerHeight}
                  height={innerHeight}
                  formatter={xAxis?.formatter as ((v: string) => string) | undefined}
                />
              )}
              {bars.map((rect, i) => {
                const series = visibleSeries[rect.seriesIndex];
                return (
                  <rect
                    key={i}
                    className="entropix-chart__bar"
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    fill={rect.color}
                    onMouseEnter={(e) =>
                      handleBarEnter(rect, series?.name ?? "", e)
                    }
                    onMouseLeave={handleBarLeave}
                  />
                );
              })}
            </g>
          );
        }}
      </ChartContainer>
      {showTooltip && (
        <ChartTooltip data={tooltip} containerRef={containerRef} />
      )}
      {showLegend && allSeries.length > 1 && (
        <ChartLegend items={legendItems} onToggle={toggleSeries} />
      )}
    </div>
  );
}
