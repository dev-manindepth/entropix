import { createContext, useContext } from "react";
import { defaultLocale, type EntropixLocale } from "@entropix/core";

export const LocaleContext = createContext<EntropixLocale>(defaultLocale);

/**
 * useLocale — access the current locale from the nearest EntropixProvider.
 *
 * Returns the full EntropixLocale object with all translation keys.
 * Works without a provider (defaults to English).
 */
export function useLocale(): EntropixLocale {
  return useContext(LocaleContext);
}
