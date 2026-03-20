import React from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../../theme/theme-context.js";
import { useBreakpoint } from "../../utils/use-breakpoint.js";

export type ContainerSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

export interface ContainerProps extends ViewProps {
  /** Maximum width constraint. Default: "lg" (1024px). On mobile this mainly affects tablet/web. */
  maxWidth?: ContainerSize;
  /** Whether to center children horizontally */
  center?: boolean;
  children?: React.ReactNode;
}

const maxWidthMap: Record<ContainerSize, number | undefined> = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  full: undefined,
};

/**
 * Container — responsive page-level wrapper with adaptive horizontal padding.
 *
 * Padding scales with screen size using breakpoint tokens:
 * - Mobile (<768px): `space.layout.page-margin` (24px)
 * - Tablet (≥768px): `space.layout.page-margin-md` (32px)
 * - Desktop (≥1024px): `space.layout.page-margin-lg` (40px)
 *
 * ```tsx
 * <Container maxWidth="lg">
 *   <Stack gap="xl">
 *     <Text>Page content</Text>
 *   </Stack>
 * </Container>
 * ```
 */
export function Container({
  maxWidth = "lg",
  center,
  style,
  children,
  ...rest
}: ContainerProps) {
  const { baseTokens: bt } = useTheme();
  const breakpoint = useBreakpoint();

  const maxW = maxWidthMap[maxWidth];

  // Responsive page margin: scales up at tablet and desktop breakpoints
  let pageMargin = bt.entropixSpaceLayoutPageMargin as number;
  if (breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl") {
    pageMargin = bt.entropixSpaceLayoutPageMarginLg as number;
  } else if (breakpoint === "md") {
    pageMargin = bt.entropixSpaceLayoutPageMarginMd as number;
  }

  return (
    <View
      style={[
        {
          width: "100%",
          paddingHorizontal: pageMargin,
        } as ViewStyle,
        maxW !== undefined && { maxWidth: maxW, alignSelf: "center" as const },
        center && { alignItems: "center" as const },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
