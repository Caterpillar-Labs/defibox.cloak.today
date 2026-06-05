// src/components/swap/SwapDetails.tsx
import { useState } from "react";
import type { ParsedPair, QuoteResult } from "../../lib/defibox";
import { useLanguage } from "../../providers/LanguageProvider";

type SwapDetailsProps = {
  quote: QuoteResult | null;
  selectedPair: ParsedPair | null;
  inputTokenCode: string | null;
  outputTokenCode: string | null;
  priceLabel: string;
  depthLabel: string;
  feeBps: bigint;
  slippageBpsText: string;
  onSlippageBpsTextChange: (value: string) => void;
};

export function SwapDetails({
  quote,
  selectedPair,
  inputTokenCode,
  outputTokenCode,
  priceLabel,
  depthLabel,
  feeBps,
  slippageBpsText,
  onSlippageBpsTextChange,
}: SwapDetailsProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`details${expanded ? " is-expanded" : ""}`}>
      <div className="detailsHeader">
        <span>{t("details.title")}</span>
        <button type="button" className="detailsToggle" onClick={() => setExpanded((value) => !value)}>
          {expanded ? t("details.hide") : t("details.show")}
          <span className="detailsToggleIcon" aria-hidden="true">
            ▾
          </span>
        </button>
      </div>

      {expanded && (
        <div className="detailsBody">
          <div className="detailRow">
            <span>{t("details.price")}</span>
            <strong>{quote && inputTokenCode && outputTokenCode ? priceLabel : "-"}</strong>
          </div>
          <div className="detailRow">
            <span>{t("details.poolDepth")}</span>
            <strong>{selectedPair ? depthLabel : "-"}</strong>
          </div>
          <div className="detailRow">
            <span>{t("details.fee")}</span>
            <strong>{feeBps.toString()} {t("details.bps")}</strong>
          </div>
          <div className="detailRow">
            <span>{t("details.minOutput")}</span>
            <strong>{quote ? quote.minOut.toString() : "-"}</strong>
          </div>
          <div className="detailRow">
            <label htmlFor="slippage">{t("details.slippage")}</label>
            <div className="slippageInput">
              <input
                id="slippage"
                value={slippageBpsText}
                onChange={(e) => onSlippageBpsTextChange(e.target.value)}
                inputMode="numeric"
              />
              <span>{t("details.bps")}</span>
            </div>
          </div>
          <div className="memoBox">{quote ? quote.memo : t("details.memoPlaceholder")}</div>
        </div>
      )}
    </div>
  );
}
