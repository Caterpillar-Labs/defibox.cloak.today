// src/components/swap/TokenSelector.tsx
import { useState } from "react";
import { useLanguage } from "../../providers/LanguageProvider";
import { tokenKey, type SwapToken } from "../../lib/swapTokens";
import { TokenIcon } from "./TokenIcon";
import { TokenSelectModal } from "./TokenSelectModal";

type TokenSelectorProps = {
  token: SwapToken | null;
  tokens: SwapToken[];
  balancesByKey: ReadonlyMap<string, bigint | null>;
  balancesLoading?: boolean;
  disabled?: boolean;
  onSelectTokenKey: (key: string) => void;
};

export function TokenSelector({
  token,
  tokens,
  balancesByKey,
  balancesLoading = false,
  disabled = false,
  onSelectTokenKey,
}: TokenSelectorProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  function handleSelect(key: string) {
    onSelectTokenKey(key);
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="tokenSelectorTrigger"
        onClick={() => setIsOpen(true)}
        disabled={disabled || tokens.length === 0}
        aria-label={t("token.selectToken")}
        aria-haspopup="dialog">
        {token ? (
          <span className="tokenSelectorTriggerContent">
            <TokenIcon code={token.code} size={40} />
            <span className="tokenSelectorTriggerText">
              <strong>{token.code}</strong>
              <small>{token.contract}</small>
            </span>
          </span>
        ) : (
          <span className="tokenSelectorTriggerPlaceholder">{t("token.selectToken")}</span>
        )}
      </button>

      {isOpen && (
        <TokenSelectModal
          tokens={tokens}
          selectedKey={token ? tokenKey(token) : ""}
          balancesByKey={balancesByKey}
          balancesLoading={balancesLoading}
          onClose={() => setIsOpen(false)}
          onSelect={handleSelect}
        />
      )}
    </>
  );
}
