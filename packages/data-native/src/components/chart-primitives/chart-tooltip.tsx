import React from "react";
import { View, Text, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@entropix/react-native";
import type { TooltipData } from "@entropix/core";

export interface ChartTooltipProps {
  /** Tooltip data. Pass null to hide. */
  data: TooltipData | null;
}

export function ChartTooltip({ data }: ChartTooltipProps) {
  const { baseTokens: bt } = useTheme();

  if (!data) return null;

  const tooltipStyle: StyleProp<ViewStyle> = {
    position: "absolute",
    left: data.x,
    top: data.y - 60,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    borderRadius: bt.entropixRadiusSm as number,
    paddingHorizontal: (bt.entropixSpacing2 as number) ?? 8,
    paddingVertical: (bt.entropixSpacing1 as number) ?? 4,
    flexDirection: "column",
    gap: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    // Prevent tooltip from being cut off
    zIndex: 999,
  };

  const fontSize = (bt.entropixFontSizeXs as number) ?? 10;

  return (
    <View style={tooltipStyle} pointerEvents="none">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: data.color,
          }}
        />
        <Text style={{ color: "#FFFFFF", fontSize, fontWeight: "600" }}>
          {data.series}
        </Text>
      </View>
      <Text style={{ color: "rgba(255,255,255,0.8)", fontSize }}>
        {data.label}: {data.value}
      </Text>
    </View>
  );
}
