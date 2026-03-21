import React from "react";
import { G, Line, Text as SvgText } from "react-native-svg";
import { useTheme } from "@entropix/react-native";
import type { BandScale } from "@entropix/core";

export interface XAxisProps {
  /** Band scale for positioning labels */
  scale: BandScale;
  /** Y position of the axis line */
  y: number;
  /** Optional label formatter */
  formatter?: (value: string) => string;
}

export function XAxis({ scale, y, formatter }: XAxisProps) {
  const { tokens: st, baseTokens: bt } = useTheme();
  const domain = scale.domain();
  const [rangeStart, rangeEnd] = scale.range();
  const bandwidth = scale.bandwidth();
  const textColor = st.entropixColorTextPrimary as string;
  const lineColor = st.entropixColorBorderDefault as string;
  const fontSize = (bt.entropixFontSizeXs as number) ?? 10;

  return (
    <G>
      <Line
        x1={rangeStart}
        y1={y}
        x2={rangeEnd}
        y2={y}
        stroke={lineColor}
        strokeWidth={1}
      />
      {domain.map((label) => {
        const x = scale(label) + bandwidth / 2;
        const displayLabel = formatter ? formatter(label) : label;
        return (
          <SvgText
            key={label}
            x={x}
            y={y + fontSize + 4}
            fontSize={fontSize}
            fill={textColor}
            textAnchor="middle"
          >
            {displayLabel}
          </SvgText>
        );
      })}
    </G>
  );
}
