import React, { useRef, useEffect, useState } from "react";
import type { TooltipData } from "@entropix/core";

export interface ChartTooltipProps {
  data: TooltipData | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function ChartTooltip({ data, containerRef }: ChartTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });

  useEffect(() => {
    if (!data || !tooltipRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const tooltip = tooltipRef.current;
    const containerRect = container.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    let left = data.x + 12;
    let top = data.y - tooltipHeight / 2;

    // Keep within container bounds
    if (left + tooltipWidth > containerRect.width) {
      left = data.x - tooltipWidth - 12;
    }
    if (top < 0) {
      top = 0;
    }
    if (top + tooltipHeight > containerRect.height) {
      top = containerRect.height - tooltipHeight;
    }

    setPosition({ left, top });
  }, [data, containerRef]);

  return (
    <div
      ref={tooltipRef}
      className={`entropix-chart__tooltip${data ? " entropix-chart__tooltip--visible" : ""}`}
      style={{
        left: position.left,
        top: position.top,
      }}
    >
      {data && (
        <div className="entropix-chart__tooltip-row">
          <span
            className="entropix-chart__tooltip-swatch"
            style={{ backgroundColor: data.color }}
          />
          <span>
            {data.series}: {data.label} — {data.value}
          </span>
        </div>
      )}
    </div>
  );
}
