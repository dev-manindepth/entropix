import React, { useState, useCallback, useMemo } from "react";
import { View, type StyleProp, type ViewStyle, type LayoutChangeEvent } from "react-native";
import { useTheme } from "@entropix/react-native";

export interface ChartContainerProps {
  /** Chart height in pixels (default 300) */
  height?: number;
  /** Override wrapper View style */
  style?: StyleProp<ViewStyle>;
  /** Render function receiving measured (width, height) */
  children: (width: number, height: number) => React.ReactNode;
}

export function ChartContainer({
  height = 300,
  style,
  children,
}: ChartContainerProps) {
  const { tokens: st, baseTokens: bt } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0) {
      setContainerWidth(width);
    }
  }, []);

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      height,
      borderWidth: 1,
      borderColor: st.entropixColorBorderDefault as string,
      borderRadius: bt.entropixRadiusMd as number,
      backgroundColor: st.entropixColorSurfaceDefault as string,
      overflow: "hidden",
    }),
    [height, st, bt],
  );

  return (
    <View style={[containerStyle, style]} onLayout={handleLayout}>
      {containerWidth > 0 ? children(containerWidth, height) : null}
    </View>
  );
}
