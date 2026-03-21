import React, { useState, useRef, useCallback } from "react";
import type {
  ChartData,
  AxisConfig,
  TooltipData,
  LegendItem,
  LinePoint,
} from "@entropix/core";
import {
  normalizeChartData,
  getDataExtent,
  niceBounds,
  createLinearScale,
  createBandScale,
  computeLinePoints,
  describeLinePath,
} from "@entropix/core";
import { ChartContainer } from "../chart-primitives/chart-container.js";
import { XAxis } from "../chart-primitives/x-axis.js";
import { YAxis } from "../chart-primitives/y-axis.js";
import { ChartTooltip } from "../chart-primitives/chart-tooltip.js";
import { ChartLegend } from "../chart-primitives/chart-legend.js";
import "../../styles/chart.css";

export interface LineChartProps {
  data: ChartData;
  height?: number;
  colors?: string[];
  curved?: boolean;
  showPoints?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  className?: string;
}

const MARGINS = { top: 20, right: 20, bottom: 40, left: 50 };

export function LineChart({
  data,
  height = 300,
  colors,
  curved = false,
  showPoints = true,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  xAxis,
  yAxis,
  className,
}: LineChartProps) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleSeries = useCallback((name: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const allSeries = normalizeChartData(data, colors);
  const visibleSeries = allSeries.filter((s) => !hiddenSeries.has(s.name));
  const { categories, yMin, yMax } = getDataExtent(visibleSeries);

  const legendItems: LegendItem[] = allSeries.map((s) => ({
    name: s.name,
    color: s.color,
    active: !hiddenSeries.has(s.name),
  }));

  const handlePointEnter = useCallback(
    (point: LinePoint, seriesName: string, color: string) => {
      if (!showTooltip) return;
      setTooltip({
        x: point.x + MARGINS.left,
        y: point.y + MARGINS.top,
        series: seriesName,
        label: point.label,
        value: point.value,
        color,
      });
    },
    [showTooltip],
  );

  const handlePointLeave = useCallback(() => {
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

          return (
            <g transform={`translate(${MARGINS.left}, ${MARGINS.top})`}>
              {yAxis?.show !== false && (
                <YAxis
                  scale={yScale}
                  x={0}
                  width={innerWidth}
                  showGrid={showGrid}
                  formatter={yAxis?.formatter as ((v: number) => string) | undefined}
                />
              )}
              {xAxis?.show !== false && (
                <XAxis
                  scale={xScale}
                  y={innerHeight}
                  height={innerHeight}
                  formatter={xAxis?.formatter as ((v: string) => string) | undefined}
                />
              )}
              {visibleSeries.map((series) => {
                const points = computeLinePoints(series, xScale, yScale);
                const pathD = describeLinePath(points, curved);

                return (
                  <g key={series.name}>
                    <path
                      className="entropix-chart__line"
                      d={pathD}
                      stroke={series.color}
                    />
                    {showPoints &&
                      points.map((pt, i) => (
                        <circle
                          key={i}
                          className="entropix-chart__point"
                          cx={pt.x}
                          cy={pt.y}
                          r={3.5}
                          fill={series.color}
                          onMouseEnter={() =>
                            handlePointEnter(pt, series.name, series.color)
                          }
                          onMouseLeave={handlePointLeave}
                        />
                      ))}
                  </g>
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
