// src/components/swap/TokenSelectModal.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { compactAsset } from "../../lib/eosioAsset";
import { lockBodyScroll, unlockBodyScroll } from "../../lib/bodyScrollLock";
import { filterSwapTokens } from "../../lib/tokenSearch";
import { tokenKey, type SwapToken } from "../../lib/swapTokens";
import { useLanguage } from "../../providers/LanguageProvider";
import { Skeleton } from "../Skeleton";
import { TokenIcon } from "./TokenIcon";

type TokenSelectModalProps = {
  tokens: SwapToken[];
  selectedKey: string;
  balancesByKey: ReadonlyMap<string, bigint | null>;
  balancesLoading?: boolean;
  onClose: () => void;
  onSelect: (key: string) => void;
};

export function TokenSelectModal({
  tokens,
  selectedKey,
  balancesByKey,
  balancesLoading = false,
  onClose,
  onSelect,
}: TokenSelectModalProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filteredTokens = useMemo(() => filterSwapTokens(tokens, searchTerm), [tokens, searchTerm]);

  useEffect(() => {
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const modal = (
    <div className="tokenModalOverlay modal-overlay" onClick={onClose}>
      <div
        className="tokenModal"
        role="dialog"
        aria-modal="true"
        aria-label={t("token.selectToken")}
        onClick={(event) => event.stopPropagation()}>
        <div className="tokenModalHeader">
          <h3>{t("token.selectToken")}</h3>
          <button type="button" className="tokenModalClose" onClick={onClose} aria-label={t("token.close")}>
            ×
          </button>
        </div>

        <div className="tokenModalSearchWrap">
          <input
            ref={searchInputRef}
            type="search"
            className="tokenModalSearch"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t("token.searchPlaceholder")}
            aria-label={t("token.searchPlaceholder")}
          />
        </div>

        <div className="tokenModalList" role="listbox">
          {filteredTokens.length === 0 ? (
            <div className="tokenModalEmpty">{t("token.noTokens")}</div>
          ) : (
            filteredTokens.map((token) => {
              const key = tokenKey(token);
              const isSelected = key === selectedKey;
              const balance = balancesByKey.get(key) ?? null;

              return (
                <button
                  key={key}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`tokenModalItem${isSelected ? " is-selected" : ""}`}
                  onClick={() => onSelect(key)}>
                  <TokenIcon code={token.code} size={44} />
                  <span className="tokenModalItemBody">
                    <strong>{token.code}</strong>
                    <span className="tokenModalItemContract">{token.contract}</span>
                  </span>
                  <span className="tokenModalItemAside">
                    {balancesLoading ? (
                      <Skeleton width={72} height={14} rounded="sm" />
                    ) : (
                      <span className="tokenModalItemBalance">
                        {balance != null ? compactAsset(balance, token.precision, token.code) : "-"}
                      </span>
                    )}
                    {isSelected && (
                      <span className="tokenModalItemCheck" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : modal;
}
