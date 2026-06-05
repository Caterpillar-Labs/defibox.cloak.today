// src/types/localeTypes.ts
export type AppLocale = "en" | "zh" | "ko" | "ru";

export const SUPPORTED_LOCALES: readonly AppLocale[] = ["en", "zh", "ko", "ru"] as const;
