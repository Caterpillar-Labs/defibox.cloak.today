// src/components/LanguageSelector.tsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Dropdown } from "./dropdown/Dropdown";
import { flagIconUrls } from "../lib/i18n/flags";
import { getLocaleLabelKey } from "../lib/i18n/locale";
import { useLanguage } from "../providers/LanguageProvider";
import type { DropdownOption } from "../types/dropdownTypes";
import { SUPPORTED_LOCALES, type AppLocale } from "../types/localeTypes";

type TooltipPlacement = "top" | "right";

const TOOLTIP_GAP_PX = 10;
const VIEWPORT_MARGIN_PX = 16;
const TOOLTIP_HIDE_MS = 180;

function optionLabelText(option: DropdownOption | null): string | null {
  if (!option || typeof option.label !== "string") return null;
  return option.label;
}

function resolveTooltipPlacement(
  anchorRect: DOMRect,
  tooltipWidth: number,
  viewportWidth: number,
): TooltipPlacement {
  const spaceRight = viewportWidth - anchorRect.right - VIEWPORT_MARGIN_PX;
  const requiredWidth = tooltipWidth + TOOLTIP_GAP_PX;
  return spaceRight >= requiredWidth ? "right" : "top";
}

export function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage();
  const wrapRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [tooltipPlacement, setTooltipPlacement] = useState<TooltipPlacement>("top");
  const currentLabel = t(getLocaleLabelKey(locale));
  const tooltipText = hoveredLabel ?? currentLabel;
  const showWrapTooltip = tooltipVisible && (!dropdownOpen || !hoveredLabel);

  const options = useMemo(
    () =>
      SUPPORTED_LOCALES.map((value) => ({
        value,
        label: t(getLocaleLabelKey(value)),
        icon: flagIconUrls[value],
      })),
    [t],
  );

  useEffect(() => {
    if (tooltipVisible) return;
    const timeoutId = window.setTimeout(() => setHoveredLabel(null), TOOLTIP_HIDE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [tooltipVisible]);

  useLayoutEffect(() => {
    if (!showWrapTooltip) return;

    function updatePlacement() {
      const wrap = wrapRef.current;
      const tooltip = tooltipRef.current;
      if (!wrap || !tooltip) return;

      setTooltipPlacement(
        resolveTooltipPlacement(wrap.getBoundingClientRect(), tooltip.offsetWidth, window.innerWidth),
      );
    }

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    return () => window.removeEventListener("resize", updatePlacement);
  }, [showWrapTooltip, tooltipText]);

  return (
    <div className="languageSelectorWrap" ref={wrapRef}>
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
        onOpenChange={setDropdownOpen}
        onGroupMouseEnter={() => setTooltipVisible(true)}
        onGroupMouseLeave={() => setTooltipVisible(false)}
        onOptionHover={(option) => {
          setHoveredLabel(optionLabelText(option));
          if (option) {
            setTooltipVisible(true);
          }
        }}
      />
      <span
        ref={tooltipRef}
        className={`heroControlTooltip languageSelectorTooltip${tooltipPlacement === "right" ? " is-right" : ""}${showWrapTooltip ? " is-visible" : ""}`}
        role="tooltip">
        {tooltipText}
      </span>
    </div>
  );
}
