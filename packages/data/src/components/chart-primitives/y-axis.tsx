import React from "react";
import type { LinearScale } from "@entropix/core";

export interface YAxisProps {
  scale: LinearScale;
  x: number;
  width: number;
  formatter?: (v: number) => string;
  showGrid?: boolean;
}

export function YAxis({
  scale,
  x,
  width,
  formatter,
  showGrid = true,
}: YAxisProps) {
  const ticks = scale.ticks();

  return (
    <g>
      {ticks.map((tick) => {
        const y = scale(tick);
        return (
          <g key={tick} transform={`translate(${x}, ${y})`}>
            <text
              className="entropix-chart__axis-text"
              x={-8}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {formatter ? formatter(tick) : String(tick)}
            </text>
            {showGrid && (
              <line
                className="entropix-chart__grid-line"
                x1={0}
                x2={width}
                y1={0}
                y2={0}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
