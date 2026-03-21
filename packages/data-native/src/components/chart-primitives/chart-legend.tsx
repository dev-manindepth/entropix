import React from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme } from "@entropix/react-native";
import type { LegendItem } from "@entropix/core";

export interface ChartLegendProps {
  /** Legend items to render */
  items: LegendItem[];
  /** Callback when a legend item is toggled */
  onToggle: (name: string) => void;
}

export function ChartLegend({ items, onToggle }: ChartLegendProps) {
  const { tokens: st, baseTokens: bt } = useTheme();
  const textColor = st.entropixColorTextPrimary as string;
  const fontSize = (bt.entropixFontSizeSm as number) ?? 12;

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: (bt.entropixSpacing2 as number) ?? 8,
        paddingVertical: (bt.entropixSpacing1 as number) ?? 4,
        paddingHorizontal: (bt.entropixSpacing2 as number) ?? 8,
      }}
    >
      {items.map((item) => (
        <Pressable
          key={item.name}
          onPress={() => onToggle(item.name)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            opacity: item.active ? 1 : 0.4,
          }}
          accessibilityRole="button"
          accessibilityLabel={`Toggle ${item.name}`}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: item.color,
            }}
          />
          <Text style={{ color: textColor, fontSize }}>
            {item.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
