import React, { useState, useRef, useCallback } from "react";
import type {
  ChartDataPoint,
  TooltipData,
  LegendItem,
} from "@entropix/core";
import { computeArcGeometry, getSeriesColor } from "@entropix/core";
import { ChartContainer } from "../chart-primitives/chart-container.js";
import { ChartTooltip } from "../chart-primitives/chart-tooltip.js";
import { ChartLegend } from "../chart-primitives/chart-legend.js";
import "../../styles/chart.css";

export interface PieChartProps {
  data: ChartDataPoint[];
  height?: number;
  colors?: string[];
  innerRadius?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
}

export function PieChart({
  data,
  height = 300,
  colors,
  innerRadius = 0,
  showTooltip = true,
  showLegend = true,
  className,
}: PieChartProps) {
  const [hiddenSlices, setHiddenSlices] = useState<Set<string>>(new Set());
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleSlice = useCallback((name: string) => {
    setHiddenSlices((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const coloredData = data.map((d, i) => ({
    ...d,
    color: getSeriesColor(i, colors),
  }));

  const visibleData = coloredData.filter((d) => !hiddenSlices.has(d.label));

  const legendItems: LegendItem[] = coloredData.map((d) => ({
    name: d.label,
    color: d.color,
    active: !hiddenSlices.has(d.label),
  }));

  const handleArcEnter = useCallback(
    (
      label: string,
      value: number,
      percentage: number,
      color: string,
      cx: number,
      cy: number,
    ) => {
      if (!showTooltip) return;
      setTooltip({
        x: cx,
        y: cy,
        series: `${(percentage * 100).toFixed(1)}%`,
        label,
        value,
        color,
      });
    },
    [showTooltip],
  );

  const handleArcLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <div ref={containerRef} className={className ? `entropix-chart ${className}` : "entropix-chart"} style={{ position: "relative" }}>
      <ChartContainer height={height}>
        {(width, h) => {
          const cx = width / 2;
          const cy = h / 2;
          const outerRadius = Math.min(cx, cy) - 10;

          if (outerRadius <= 0) return null;

          const slices = computeArcGeometry(
            visibleData,
            outerRadius,
            innerRadius,
          );

          return (
            <g transform={`translate(${cx}, ${cy})`}>
              {slices.map((slice, i) => {
                const midAngle =
                  (slice.startAngle + slice.endAngle) / 2;
                const tooltipX =
                  cx +
                  (outerRadius * 0.6) * Math.cos(midAngle);
                const tooltipY =
                  cy +
                  (outerRadius * 0.6) * Math.sin(midAngle);

                return (
                  <path
                    key={i}
                    className="entropix-chart__arc"
                    d={slice.path}
                    fill={slice.color}
                    onMouseEnter={() =>
                      handleArcEnter(
                        slice.label,
                        slice.value,
                        slice.percentage,
                        slice.color,
                        tooltipX,
                        tooltipY,
                      )
                    }
                    onMouseLeave={handleArcLeave}
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
      {showLegend && (
        <ChartLegend items={legendItems} onToggle={toggleSlice} />
      )}
    </div>
  );
}
