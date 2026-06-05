// src/components/LanguageSelector.tsx
import { useMemo, useState } from "react";
import { Dropdown } from "./dropdown/Dropdown";
import { flagIconUrls } from "../lib/i18n/flags";
import { getLocaleLabelKey } from "../lib/i18n/locale";
import { useLanguage } from "../providers/LanguageProvider";
import { SUPPORTED_LOCALES, type AppLocale } from "../types/localeTypes";

export function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const currentLabel = t(getLocaleLabelKey(locale));

  const options = useMemo(
    () =>
      SUPPORTED_LOCALES.map((value) => ({
        value,
        label: t(getLocaleLabelKey(value)),
        icon: flagIconUrls[value],
      })),
    [t],
  );

  return (
    <div
      className="languageSelectorWrap"
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}>
      <Dropdown
        className="language-selector hero-language-selector"
        aria-label={t("language.selector")}
        value={locale}
        onChange={(value) => setLocale(value as AppLocale)}
        options={options}
        showLabel={false}
        hideArrow
        enableSearch={false}
        openDirection="down"
        style={{ width: "44px", height: "44px" }}
      />
      <span
        className={`heroControlTooltip${tooltipVisible ? " is-visible" : ""}`}
        role="tooltip">
        {currentLabel}
      </span>
    </div>
  );
}
