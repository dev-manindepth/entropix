import React from "react";
import { G, Line, Text as SvgText } from "react-native-svg";
import { useTheme } from "@entropix/react-native";
import type { LinearScale } from "@entropix/core";

export interface YAxisProps {
  /** Linear scale for positioning ticks */
  scale: LinearScale;
  /** X position of the axis line */
  x: number;
  /** Chart inner width (used for grid lines) */
  width: number;
  /** Optional value formatter */
  formatter?: (value: number) => string;
  /** Show horizontal grid lines at each tick (default false) */
  showGrid?: boolean;
}

export function YAxis({ scale, x, width, formatter, showGrid = false }: YAxisProps) {
  const { tokens: st, baseTokens: bt } = useTheme();
  const ticks = scale.ticks(5);
  const [rangeStart, rangeEnd] = scale.range();
  const textColor = st.entropixColorTextPrimary as string;
  const lineColor = st.entropixColorBorderDefault as string;
  const gridColor = st.entropixColorBorderDefault as string;
  const fontSize = (bt.entropixFontSizeXs as number) ?? 10;

  return (
    <G>
      <Line
        x1={x}
        y1={rangeStart}
        x2={x}
        y2={rangeEnd}
        stroke={lineColor}
        strokeWidth={1}
      />
      {ticks.map((tick) => {
        const y = scale(tick);
        const displayValue = formatter ? formatter(tick) : String(tick);
        return (
          <G key={tick}>
            {showGrid && (
              <Line
                x1={x}
                y1={y}
                x2={x + width}
                y2={y}
                stroke={gridColor}
                strokeWidth={0.5}
                strokeDasharray="4,4"
                opacity={0.5}
              />
            )}
            <SvgText
              x={x - 6}
              y={y + fontSize / 3}
              fontSize={fontSize}
              fill={textColor}
              textAnchor="end"
            >
              {displayValue}
            </SvgText>
          </G>
        );
      })}
    </G>
  );
}
