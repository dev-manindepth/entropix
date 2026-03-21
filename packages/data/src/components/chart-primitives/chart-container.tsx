import React, { useRef, useState, useEffect, useCallback } from "react";

export interface ChartContainerProps {
  height?: number;
  className?: string;
  children: (width: number, height: number) => React.ReactNode;
}

export function ChartContainer({
  height = 300,
  className,
  children,
}: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.clientWidth);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    handleResize();

    const observer = new ResizeObserver(() => {
      handleResize();
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [handleResize]);

  return (
    <div
      ref={containerRef}
      className={
        className ? `entropix-chart ${className}` : "entropix-chart"
      }
      style={{ position: "relative", width: "100%" }}
    >
      {width > 0 && (
        <svg
          className="entropix-chart__svg"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {children(width, height)}
        </svg>
      )}
    </div>
  );
}
