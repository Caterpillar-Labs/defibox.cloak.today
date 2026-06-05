// src/providers/LanguageProvider.tsx
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppLocale } from "../types/localeTypes";
import { applyLocale, getStoredLocale, persistLocale } from "../lib/i18n/locale";
import { translate, type MessageKey } from "../lib/i18n/messages";

type LanguageContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: MessageKey, vars?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => getStoredLocale());

  useEffect(() => {
    applyLocale(locale);
    persistLocale(locale);
  }, [locale]);

  const value = useMemo(
    (): LanguageContextValue => ({
      locale,
      setLocale: setLocaleState,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
