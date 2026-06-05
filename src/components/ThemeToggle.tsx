// src/components/ThemeToggle.tsx
import { useEffect, useRef, useState } from "react";
import { applyTheme, getStoredTheme, persistTheme, type ThemeMode } from "../lib/theme";
import { useLanguage } from "../providers/LanguageProvider";

export function ThemeToggle() {
  const { t } = useLanguage();
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isDark = theme === "dark";
  const tooltip = isDark ? t("theme.switchToLight") : t("theme.switchToDark");

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
    setTooltipVisible(false);
    buttonRef.current?.blur();
  }

  return (
    <div
      className="themeToggleWrap"
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}>
      <button
        ref={buttonRef}
        type="button"
        className={`themeToggle${isDark ? " is-dark" : " is-light"}`}
        onClick={toggleTheme}
        aria-label={tooltip}
        aria-pressed={isDark}>
        <span className="themeToggleTrack">
          <span className="themeToggleThumb" aria-hidden="true" />
          <span className="themeToggleSlot themeToggleSlotLight" aria-hidden="true">
            <span className={`themeToggleSegment${isDark ? " is-inactive" : " is-active"}`}>
              <SunIcon className="themeToggleThumbIcon" />
              <span className="themeToggleLabel">{t("theme.light")}</span>
            </span>
          </span>
          <span className="themeToggleSlot themeToggleSlotDark" aria-hidden="true">
            <span className={`themeToggleSegment${isDark ? " is-active" : " is-inactive"}`}>
              <MoonIcon className="themeToggleThumbIcon" />
              <span className="themeToggleLabel">{t("theme.dark")}</span>
            </span>
          </span>
        </span>
      </button>
      <span
        className={`heroControlTooltip${tooltipVisible ? " is-visible" : ""}`}
        role="tooltip">
        {tooltip}
      </span>
    </div>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"
        fill="currentColor"
      />
    </svg>
  );
}
