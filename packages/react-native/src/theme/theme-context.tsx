import React, { createContext, useContext, useMemo } from "react";
import { tokens as baseTokens } from "@entropix/tokens/native";
import { tokens as lightTokens } from "@entropix/tokens/native/light";
import { tokens as darkTokens } from "@entropix/tokens/native/dark";
import { defaultLocale, type EntropixLocale } from "@entropix/core";
import { LocaleContext } from "../i18n/i18n-context.js";

export type EntropixTheme = typeof lightTokens;
export type ThemeMode = "light" | "dark";
export type BrandName = string;

interface ThemeContextValue {
  mode: ThemeMode;
  brand: BrandName;
  tokens: EntropixTheme;
  baseTokens: typeof baseTokens;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  brand: "default",
  tokens: lightTokens,
  baseTokens,
});

// ─── Brand Registry ─────────────────────────────────────────────────────────

type BrandThemes = Record<ThemeMode, EntropixTheme>;

const brandRegistry: Record<string, BrandThemes> = {
  default: {
    light: lightTokens,
    dark: darkTokens,
  },
};

/**
 * registerBrand — Register a custom brand's theme tokens.
 *
 * Call this before rendering EntropixProvider to make a brand available.
 *
 * ```ts
 * import { tokens as acmeLight } from "@entropix/tokens/brands/ocean/native/light";
 * import { tokens as acmeDark } from "@entropix/tokens/brands/ocean/native/dark";
 *
 * registerBrand("ocean", { light: acmeLight, dark: acmeDark });
 * ```
 */
export function registerBrand(name: string, themes: BrandThemes): void {
  brandRegistry[name] = themes;
}

// ─── Provider ───────────────────────────────────────────────────────────────

export interface EntropixProviderProps {
  /** Theme mode: "light" or "dark". Default: "light" */
  mode?: ThemeMode;
  /** Brand name. Default: "default" */
  brand?: BrandName;
  /** Override tokens directly (bypasses brand registry) */
  tokens?: EntropixTheme;
  /** Locale overrides. Merged onto defaultLocale (English). */
  locale?: Partial<EntropixLocale>;
  children: React.ReactNode;
}

/**
 * EntropixProvider — Provides theme tokens to all Entropix components.
 *
 * Wrap your app root with this provider. All Entropix components will
 * automatically pick up the current theme tokens.
 *
 * ```tsx
 * <EntropixProvider brand="ocean" mode="dark">
 *   <App />
 * </EntropixProvider>
 * ```
 */
export function EntropixProvider({
  mode = "light",
  brand = "default",
  tokens: tokenOverride,
  locale: localeOverride,
  children,
}: EntropixProviderProps) {
  const value = useMemo<ThemeContextValue>(() => {
    let resolvedTokens: EntropixTheme;

    if (tokenOverride) {
      resolvedTokens = tokenOverride;
    } else {
      const brandThemes = brandRegistry[brand] ?? brandRegistry.default;
      resolvedTokens = brandThemes![mode] ?? brandThemes!.light;
    }

    return {
      mode,
      brand,
      tokens: resolvedTokens,
      baseTokens,
    };
  }, [mode, brand, tokenOverride]);

  const resolvedLocale = useMemo<EntropixLocale>(
    () => (localeOverride ? { ...defaultLocale, ...localeOverride } : defaultLocale),
    [localeOverride],
  );

  return (
    <ThemeContext.Provider value={value}>
      <LocaleContext.Provider value={resolvedLocale}>
        {children}
      </LocaleContext.Provider>
    </ThemeContext.Provider>
  );
}

/**
 * useTheme — Access current Entropix theme tokens.
 *
 * Returns the resolved token values for the current theme and brand.
 * Must be used within an EntropixProvider.
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
