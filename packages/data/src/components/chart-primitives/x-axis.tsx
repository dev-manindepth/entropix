import React from "react";
import type { BandScale } from "@entropix/core";

export interface XAxisProps {
  scale: BandScale;
  y: number;
  height: number;
  formatter?: (v: string) => string;
}

export function XAxis({ scale, y, height: _height, formatter }: XAxisProps) {
  const domain = scale.domain();
  const bandwidth = scale.bandwidth();

  return (
    <g>
      {domain.map((label) => {
        const x = scale(label) + bandwidth / 2;
        return (
          <g key={label} transform={`translate(${x}, ${y})`}>
            <line y2={6} stroke="currentColor" strokeWidth={1} />
            <text
              className="entropix-chart__axis-text"
              y={18}
              textAnchor="middle"
              dominantBaseline="auto"
            >
              {formatter ? formatter(label) : label}
            </text>
          </g>
        );
      })}
      <line
        x1={scale.range()[0]}
        x2={scale.range()[1]}
        y1={y}
        y2={y}
        stroke="currentColor"
        strokeWidth={1}
      />
    </g>
  );
}
