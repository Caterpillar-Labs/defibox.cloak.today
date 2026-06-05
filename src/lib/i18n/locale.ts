// src/lib/i18n/locale.ts
import type { AppLocale } from "../../types/localeTypes";
import { SUPPORTED_LOCALES } from "../../types/localeTypes";
import type { MessageKey } from "./messages";

const STORAGE_KEY = "cloak-locale";

export function getStoredLocale(): AppLocale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LOCALES.includes(stored as AppLocale)) {
    return stored as AppLocale;
  }

  const browserLang = window.navigator.language.split("-")[0];
  if (browserLang === "zh" || browserLang === "ko" || browserLang === "ru") {
    return browserLang;
  }

  return "en";
}

export function persistLocale(locale: AppLocale): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, locale);
}

export function applyLocale(locale: AppLocale): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
}

export function getLocaleLabelKey(locale: AppLocale): MessageKey {
  switch (locale) {
    case "zh":
      return "language.zh";
    case "ko":
      return "language.ko";
    case "ru":
      return "language.ru";
    default:
      return "language.en";
  }
}
