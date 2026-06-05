// src/components/swap/TokenAmountBox.tsx
import { compactAsset } from "../../lib/eosioAsset";
import { useLanguage } from "../../providers/LanguageProvider";
import { Skeleton } from "../Skeleton";
import type { SwapToken } from "../../lib/swapTokens";
import { TokenSelector } from "./TokenSelector";

type TokenAmountBoxProps = {
  title: string;
  token: SwapToken | null;
  tokens: SwapToken[];
  amountText: string;
  setAmountText: (value: string) => void;
  balance: bigint | null;
  balancesByKey: ReadonlyMap<string, bigint | null>;
  balanceLoading?: boolean;
  disabled?: boolean;
  onSelectTokenKey: (key: string) => void;
};

export function TokenAmountBox({
  title,
  token,
  tokens,
  amountText,
  setAmountText,
  balance,
  balancesByKey,
  balanceLoading = false,
  disabled = false,
  onSelectTokenKey,
}: TokenAmountBoxProps) {
  const { t } = useLanguage();

  return (
    <div className="tokenBox">
      <div className="tokenBoxTop">
        <span>{title}</span>
        {balanceLoading ? (
          <Skeleton width={110} height={12} rounded="sm" />
        ) : (
          <span>
            {token && balance != null
              ? `${t("balance.label")} ${compactAsset(balance, token.precision, token.code)}`
              : `${t("balance.label")} -`}
          </span>
        )}
      </div>
      <div className="tokenMain">
        <TokenSelector
          token={token}
          tokens={tokens}
          balancesByKey={balancesByKey}
          balancesLoading={balanceLoading}
          disabled={disabled}
          onSelectTokenKey={onSelectTokenKey}
        />
        <input
          className="amountInput"
          value={amountText}
          onChange={(e) => setAmountText(e.target.value)}
          inputMode="decimal"
          placeholder={t("token.amountPlaceholder")}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
