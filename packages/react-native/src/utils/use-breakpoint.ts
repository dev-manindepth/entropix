import { useState, useEffect, useCallback } from "react";
import { Dimensions } from "react-native";

/**
 * Breakpoint values in pixels, matching @entropix/tokens breakpoint primitives.
 */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl";

const BREAKPOINT_ORDER: Breakpoint[] = ["base", "sm", "md", "lg", "xl", "2xl"];

/**
 * Returns the current breakpoint name based on screen width.
 * Uses React Native's Dimensions API and listens for screen size changes
 * (orientation changes, split-screen, etc.).
 *
 * - `"base"` — <640px (phones portrait)
 * - `"sm"` — ≥640px (phones landscape)
 * - `"md"` — ≥768px (tablets portrait)
 * - `"lg"` — ≥1024px (tablets landscape)
 * - `"xl"` — ≥1280px (large tablets / desktop)
 * - `"2xl"` — ≥1536px (wide screens)
 *
 * ```tsx
 * const breakpoint = useBreakpoint();
 * const isMobile = breakpoint === "base" || breakpoint === "sm";
 * ```
 */
export function useBreakpoint(): Breakpoint {
  const getBreakpoint = useCallback((): Breakpoint => {
    const { width } = Dimensions.get("window");
    if (width >= BREAKPOINTS["2xl"]) return "2xl";
    if (width >= BREAKPOINTS.xl) return "xl";
    if (width >= BREAKPOINTS.lg) return "lg";
    if (width >= BREAKPOINTS.md) return "md";
    if (width >= BREAKPOINTS.sm) return "sm";
    return "base";
  }, []);

  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getBreakpoint);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      const width = window.width;
      let next: Breakpoint = "base";
      if (width >= BREAKPOINTS["2xl"]) next = "2xl";
      else if (width >= BREAKPOINTS.xl) next = "xl";
      else if (width >= BREAKPOINTS.lg) next = "lg";
      else if (width >= BREAKPOINTS.md) next = "md";
      else if (width >= BREAKPOINTS.sm) next = "sm";

      setBreakpoint((prev) => (prev !== next ? next : prev));
    });

    return () => subscription.remove();
  }, []);

  return breakpoint;
}

/**
 * Returns true if the current screen width is at or above the given breakpoint.
 *
 * ```tsx
 * const isTablet = useBreakpointValue("md");
 * // true when screen ≥768px (tablet portrait and up)
 * ```
 */
export function useBreakpointValue(breakpoint: Exclude<Breakpoint, "base">): boolean {
  const current = useBreakpoint();
  const currentIndex = BREAKPOINT_ORDER.indexOf(current);
  const targetIndex = BREAKPOINT_ORDER.indexOf(breakpoint);
  return currentIndex >= targetIndex;
}

/**
 * Returns the current screen dimensions, updating on orientation/size changes.
 *
 * ```tsx
 * const { width, height } = useScreenDimensions();
 * ```
 */
export function useScreenDimensions(): { width: number; height: number } {
  const [dimensions, setDimensions] = useState(() => Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });
    return () => subscription.remove();
  }, []);

  return { width: dimensions.width, height: dimensions.height };
}

export { BREAKPOINTS, BREAKPOINT_ORDER };
