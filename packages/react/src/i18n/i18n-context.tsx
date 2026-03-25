import { createContext, useContext, useMemo } from "react";
import { defaultLocale, type EntropixLocale } from "@entropix/core";

const LocaleContext = createContext<EntropixLocale>(defaultLocale);

export interface LocaleProviderProps {
  /** Locale overrides. Merged onto defaultLocale (English). */
  locale?: Partial<EntropixLocale>;
  children: React.ReactNode;
}

/**
 * LocaleProvider — provides locale context to all Entropix components.
 *
 * Without this provider, components default to English (en-US).
 * Pass a partial locale to override specific strings, or a full
 * EntropixLocale object for a complete translation.
 *
 * ```tsx
 * <LocaleProvider locale={{ select_placeholder: "Choose..." }}>
 *   <App />
 * </LocaleProvider>
 * ```
 */
export function LocaleProvider({ locale: overrides, children }: LocaleProviderProps) {
  const resolved = useMemo<EntropixLocale>(
    () => (overrides ? { ...defaultLocale, ...overrides } : defaultLocale),
    [overrides],
  );

  return (
    <LocaleContext.Provider value={resolved}>
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * useLocale — access the current locale from the nearest LocaleProvider.
 *
 * Returns the full EntropixLocale object with all translation keys.
 * Works without a provider (defaults to English).
 */
export function useLocale(): EntropixLocale {
  return useContext(LocaleContext);
}
