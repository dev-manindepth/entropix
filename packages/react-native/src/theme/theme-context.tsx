import React, { createContext, useContext, useMemo } from "react";
import { tokens as baseTokens } from "@entropix/tokens/native";
import { tokens as lightTokens } from "@entropix/tokens/native/light";
import { tokens as darkTokens } from "@entropix/tokens/native/dark";

export type EntropixTheme = typeof lightTokens;
export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  tokens: EntropixTheme;
  baseTokens: typeof baseTokens;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  tokens: lightTokens,
  baseTokens,
});

export interface EntropixProviderProps {
  /** Theme mode: "light" or "dark". Default: "light" */
  mode?: ThemeMode;
  children: React.ReactNode;
}

/**
 * EntropixProvider — Provides theme tokens to all Entropix components.
 *
 * Wrap your app root with this provider. All Entropix components will
 * automatically pick up the current theme tokens.
 *
 * ```tsx
 * <EntropixProvider mode="dark">
 *   <App />
 * </EntropixProvider>
 * ```
 */
export function EntropixProvider({
  mode = "light",
  children,
}: EntropixProviderProps) {
  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      tokens: mode === "dark" ? darkTokens : lightTokens,
      baseTokens,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * useTheme — Access current Entropix theme tokens.
 *
 * Returns the resolved token values for the current theme (light or dark).
 * Must be used within an EntropixProvider.
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
