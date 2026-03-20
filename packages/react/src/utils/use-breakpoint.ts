import { useState, useEffect, useCallback } from "react";

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
 * Returns the current breakpoint name based on viewport width.
 *
 * - `"base"` — <640px (mobile)
 * - `"sm"` — ≥640px (landscape phones)
 * - `"md"` — ≥768px (tablets)
 * - `"lg"` — ≥1024px (laptops)
 * - `"xl"` — ≥1280px (desktops)
 * - `"2xl"` — ≥1536px (wide screens)
 *
 * ```tsx
 * const breakpoint = useBreakpoint();
 * const isMobile = breakpoint === "base" || breakpoint === "sm";
 * ```
 */
export function useBreakpoint(): Breakpoint {
  const getBreakpoint = useCallback((): Breakpoint => {
    if (typeof window === "undefined") return "base";
    const width = window.innerWidth;
    if (width >= BREAKPOINTS["2xl"]) return "2xl";
    if (width >= BREAKPOINTS.xl) return "xl";
    if (width >= BREAKPOINTS.lg) return "lg";
    if (width >= BREAKPOINTS.md) return "md";
    if (width >= BREAKPOINTS.sm) return "sm";
    return "base";
  }, []);

  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getBreakpoint);

  useEffect(() => {
    const handleResize = () => {
      const next = getBreakpoint();
      setBreakpoint((prev) => (prev !== next ? next : prev));
    };

    window.addEventListener("resize", handleResize);
    // Set initial value on mount (handles SSR hydration)
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [getBreakpoint]);

  return breakpoint;
}

/**
 * Subscribes to a CSS media query and returns whether it matches.
 *
 * ```tsx
 * const isMobile = useMediaQuery("(max-width: 767px)");
 * const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Set initial value
    setMatches(mql.matches);

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/**
 * Returns true if the current viewport is at or above the given breakpoint.
 *
 * ```tsx
 * const isDesktop = useBreakpointValue("lg");
 * // true when viewport ≥1024px
 * ```
 */
export function useBreakpointValue(breakpoint: Exclude<Breakpoint, "base">): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
}

export { BREAKPOINTS, BREAKPOINT_ORDER };
