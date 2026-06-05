// src/components/swap/TokenOutputBox.tsx
import { compactAsset, unitsToHumanTrimmed } from "../../lib/eosioAsset";
import type { QuoteResult } from "../../lib/defibox";
import { useLanguage } from "../../providers/LanguageProvider";
import { Skeleton } from "../Skeleton";
import type { SwapToken } from "../../lib/swapTokens";
import { TokenSelector } from "./TokenSelector";

type TokenOutputBoxProps = {
  title: string;
  token: SwapToken | null;
  tokens: SwapToken[];
  quote: QuoteResult | null;
  balance: bigint | null;
  balancesByKey: ReadonlyMap<string, bigint | null>;
  balanceLoading?: boolean;
  quoteLoading?: boolean;
  disabled?: boolean;
  onSelectTokenKey: (key: string) => void;
};

export function TokenOutputBox({
  title,
  token,
  tokens,
  quote,
  balance,
  balancesByKey,
  balanceLoading = false,
  quoteLoading = false,
  disabled = false,
  onSelectTokenKey,
}: TokenOutputBoxProps) {
  const { t } = useLanguage();
  const amount = quote && token ? unitsToHumanTrimmed(quote.amountOut, token.precision, 8) : "";

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
        {quoteLoading ? (
          <Skeleton className="skeletonOutputAmount" height={34} rounded="sm" />
        ) : (
          <div className="outputAmount">{amount || "0"}</div>
        )}
      </div>
    </div>
  );
}
