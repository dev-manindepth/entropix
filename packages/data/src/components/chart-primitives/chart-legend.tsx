import React from "react";
import type { LegendItem } from "@entropix/core";

export interface ChartLegendProps {
  items: LegendItem[];
  onToggle: (name: string) => void;
}

export function ChartLegend({ items, onToggle }: ChartLegendProps) {
  if (items.length === 0) return null;

  return (
    <div className="entropix-chart__legend">
      {items.map((item) => (
        <button
          key={item.name}
          type="button"
          className={`entropix-chart__legend-item${!item.active ? " entropix-chart__legend-item--inactive" : ""}`}
          onClick={() => onToggle(item.name)}
        >
          <span
            className="entropix-chart__legend-swatch"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.name}</span>
        </button>
      ))}
    </div>
  );
}
