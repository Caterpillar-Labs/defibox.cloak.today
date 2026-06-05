import { useEffect, useMemo, useState } from "react";
import { APP_CONFIG } from "./config";
import { fetchDefiboxConfig, fetchDefiboxPairs } from "./lib/chainApi";
import { getFeeBps, isTradablePair, parsePair, quoteDirectSwap, type DefiboxConfigRow, type PairSide, type ParsedPair, type QuoteResult } from "./lib/defibox";
import { compactAsset, parseInputAmountToUnits, unitsToHumanTrimmed } from "./lib/eosioAsset";
import {
  buildSwapZActions,
  connectCloakWallet,
  disconnectCloakWallet,
  refreshAllBalances,
  resolveWalletErrorKey,
  submitSwap,
  type WalletState,
} from "./lib/zeos";
import { findBalanceInUnknownPayload } from "./lib/balances";
import {
  collectTradableTokens,
  findPairForInputToken,
  findPairForOutputToken,
  resolveTokenByKey,
  tokenKey,
} from "./lib/swapTokens";
import { AuditNotice } from "./components/AuditNotice";
import { DefiboxLogo } from "./components/DefiboxLogo";
import { LanguageSelector } from "./components/LanguageSelector";
import { Skeleton } from "./components/Skeleton";
import { SwapDetails } from "./components/swap/SwapDetails";
import { SwapFormSkeleton } from "./components/SwapFormSkeleton";
import { SwitchDirectionButton } from "./components/swap/SwitchDirectionButton";
import { TokenAmountBox } from "./components/swap/TokenAmountBox";
import { TokenOutputBox } from "./components/swap/TokenOutputBox";
import { ThemeToggle } from "./components/ThemeToggle";
import { ZactionsPreviewSkeleton } from "./components/ZactionsPreviewSkeleton";
import type { MessageKey } from "./lib/i18n/messages";
import { useLanguage } from "./providers/LanguageProvider";

type LoadState = "idle" | "loading" | "ready" | "error";

const TX_SUCCESS = "__tx_success__";
const TX_FAIL_PREFIX = "__tx_fail__";

export default function App() {
  const { t } = useLanguage();
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<DefiboxConfigRow | null>(null);
  const [pairs, setPairs] = useState<ParsedPair[]>([]);
  const [selectedPairId, setSelectedPairId] = useState<string>(APP_CONFIG.defaultPairId);
  const [inputSide, setInputSide] = useState<PairSide>(0);
  const [inputAmountText, setInputAmountText] = useState("1");
  const [slippageBpsText, setSlippageBpsText] = useState(APP_CONFIG.defaultSlippageBps);
  const [wallet, setWallet] = useState<WalletState>({ session: null, handle: null });
  const [walletError, setWalletError] = useState<string | null>(null);
  const [walletBusy, setWalletBusy] = useState(false);
  const [balancesPayload, setBalancesPayload] = useState<unknown>(null);
  const [swapBusy, setSwapBusy] = useState(false);
  const [txResult, setTxResult] = useState<string | null>(null);
  async function loadMarkets() {
    setLoadState("loading");
    setError(null);
    try {
      const [cfg, rows] = await Promise.all([fetchDefiboxConfig(), fetchDefiboxPairs()]);
      const parsed = rows.map(parsePair).filter(isTradablePair);
      setConfig(cfg);
      setPairs(parsed);
      if (!parsed.some((pair) => pair.id === selectedPairId)) {
        setSelectedPairId(parsed[0]?.id ?? "");
      }
      setLoadState("ready");
    } catch (e) {
      setError(toErrorMessage(e));
      setLoadState("error");
    }
  }

  useEffect(() => {
    void loadMarkets();
    // Intentional one-time initial load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tradableTokens = useMemo(() => collectTradableTokens(pairs), [pairs]);
  const selectedPair = useMemo(() => pairs.find((pair) => pair.id === selectedPairId) ?? null, [pairs, selectedPairId]);
  const feeBps = useMemo(() => getFeeBps(config), [config]);
  const inputToken = selectedPair ? (inputSide === 0 ? selectedPair.token0 : selectedPair.token1) : null;
  const outputToken = selectedPair ? (inputSide === 0 ? selectedPair.token1 : selectedPair.token0) : null;

  const parsedInput = useMemo(() => {
    if (!inputToken) return { amountIn: 0n, error: null as string | null };
    try {
      return { amountIn: parseInputAmountToUnits(inputAmountText, inputToken.precision), error: null };
    } catch (e) {
      return { amountIn: 0n, error: toErrorMessage(e) };
    }
  }, [inputAmountText, inputToken]);

  const slippageBps = useMemo(() => {
    try {
      if (!/^\d+$/.test(slippageBpsText.trim())) return null;
      const value = BigInt(slippageBpsText.trim());
      return value >= 0n && value < 10_000n ? value : null;
    } catch {
      return null;
    }
  }, [slippageBpsText]);

  const quote = useMemo((): QuoteResult | null => {
    if (!selectedPair || parsedInput.error || parsedInput.amountIn <= 0n || slippageBps == null) return null;
    try {
      return quoteDirectSwap({
        pair: selectedPair,
        inputSide,
        amountIn: parsedInput.amountIn,
        feeBps,
        slippageBps,
      });
    } catch {
      return null;
    }
  }, [feeBps, inputSide, parsedInput.amountIn, parsedInput.error, selectedPair, slippageBps]);

  const inputBalance = useMemo(() => {
    if (!balancesPayload || !inputToken) return null;
    return findBalanceInUnknownPayload(balancesPayload, inputToken);
  }, [balancesPayload, inputToken]);

  const outputBalance = useMemo(() => {
    if (!balancesPayload || !outputToken) return null;
    return findBalanceInUnknownPayload(balancesPayload, outputToken);
  }, [balancesPayload, outputToken]);

  const balancesByTokenKey = useMemo(() => {
    const map = new Map<string, bigint | null>();
    for (const token of tradableTokens) {
      map.set(
        tokenKey(token),
        balancesPayload ? findBalanceInUnknownPayload(balancesPayload, token) : null,
      );
    }
    return map;
  }, [balancesPayload, tradableTokens]);

  const marketsLoading = loadState === "idle" || loadState === "loading";
  const balancesLoading = walletBusy && Boolean(wallet.session);

  async function connectWallet() {
    setWalletBusy(true);
    setWalletError(null);
    try {
      const connected = await connectCloakWallet(() => {
        setWallet({ session: null, handle: null });
        setBalancesPayload(null);
        setTxResult(null);
        setWalletError(t("wallet.connectionClosed"));
      });
      setWallet(connected);
      const balances = await refreshAllBalances(connected.session!);
      setBalancesPayload(balances);
    } catch (e) {
      setWalletError(formatWalletError(e, t));
    } finally {
      setWalletBusy(false);
    }
  }

  async function refreshBalances() {
    if (!wallet.session) return;
    setWalletBusy(true);
    setWalletError(null);
    try {
      const balances = await refreshAllBalances(wallet.session);
      setBalancesPayload(balances);
    } catch (e) {
      setWalletError(formatWalletError(e, t));
    } finally {
      setWalletBusy(false);
    }
  }

  async function disconnectWallet() {
    if (!wallet.session) return;

    setWalletBusy(true);
    setWalletError(null);

    try {
      await disconnectCloakWallet(wallet.session);
    } catch (e) {
      console.warn("CLOAK wallet logout failed; clearing local UI state anyway.", e);
    } finally {
      setWallet({ session: null, handle: null });
      setBalancesPayload(null);
      setTxResult(null);
      setWalletBusy(false);
    }
  }

  function switchSides() {
    setInputSide((current) => (current === 0 ? 1 : 0));
    setTxResult(null);
  }

  function selectPaymentToken(key: string) {
    const token = resolveTokenByKey(tradableTokens, key);
    if (!token) return;

    const match = findPairForInputToken(pairs, token, outputToken);
    if (!match) return;

    setSelectedPairId(match.pair.id);
    setInputSide(match.inputSide);
    setTxResult(null);
  }

  function selectReceivedToken(key: string) {
    const token = resolveTokenByKey(tradableTokens, key);
    if (!token) return;

    const match = findPairForOutputToken(pairs, token, inputToken);
    if (!match) return;

    setSelectedPairId(match.pair.id);
    setInputSide(match.inputSide);
    setTxResult(null);
  }

  async function executeSwap() {
    if (!wallet.session || !quote || !selectedPair) return;
    setSwapBusy(true);
    setTxResult(null);
    setError(null);
    try {
      const latestConfig = await fetchDefiboxConfig();
      const latestPairs = (await fetchDefiboxPairs()).map(parsePair).filter(isTradablePair);
      const latestPair = latestPairs.find((pair) => pair.id === selectedPair.id);
      if (!latestPair) {
        throw new Error("Selected pair disappeared from pair table");
      }

      setConfig(latestConfig);
      setPairs(latestPairs);

      const latestQuote = quoteDirectSwap({
        pair: latestPair,
        inputSide,
        amountIn: parsedInput.amountIn,
        feeBps: getFeeBps(latestConfig),
        slippageBps: slippageBps ?? 300n,
      });

      const zactions = buildSwapZActions({ quote: latestQuote, amountIn: parsedInput.amountIn });
      const result = await submitSwap(wallet.session, zactions);

      if (result.status === "success") {
        setTxResult(TX_SUCCESS);
        setTimeout(() => void refreshBalances(), 6000);
      } else {
        throw new Error(toErrorMessage(result.error ?? result.detail ?? result));
      }
    } catch (e) {
      setTxResult(`${TX_FAIL_PREFIX}${toErrorMessage(e)}`);
    } finally {
      setSwapBusy(false);
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <div className="heroContent">
          <h1>
            <DefiboxLogo width={64} />
            <span>{t("hero.title")}</span>
          </h1>
          <p className="subtle">{t("hero.subtitle")}</p>
        </div>
        <div className="heroAside">
          <div className="heroControls">
            <ThemeToggle />
            <LanguageSelector />
          </div>
          <div className="walletBox">
          <div className="walletStatus">
            <span className={wallet.session ? "dot ok" : "dot"} />
            {walletBusy && !wallet.session ? (
              <Skeleton width={180} height={14} rounded="sm" />
            ) : wallet.session ? (
              t("wallet.connected", { handle: wallet.handle ?? "CLOAK wallet" })
            ) : (
              t("wallet.notConnected")
            )}
          </div>
          <button className={`secondary${walletBusy ? " is-loading" : ""}`} disabled={walletBusy} onClick={wallet.session ? refreshBalances : connectWallet}>
            {walletBusy ? t("wallet.working") : wallet.session ? t("wallet.refreshBalances") : t("wallet.connect")}
          </button>
          {wallet.session && (
            <button className="secondary danger" disabled={walletBusy || swapBusy} onClick={disconnectWallet}>
              {t("wallet.disconnect")}
            </button>
          )}
          {walletError && <p className="errorText">{walletError}</p>}
          </div>
        </div>
      </section>

      <div className="swapLayout">
      <section className="panel swapPanel">
        <div className="panelHeader">
          <strong>{t("swap.title")}</strong>
          <button className={`ghost${marketsLoading ? " is-loading" : ""}`} onClick={loadMarkets} disabled={marketsLoading}>
            {marketsLoading ? t("swap.loading") : t("swap.refreshMarkets")}
          </button>
        </div>

        {error && <div className="notice error">{error}</div>}

        {marketsLoading ? (
          <SwapFormSkeleton />
        ) : (
          <>
            <div className="swapCard">
              <TokenAmountBox
                title={t("swap.payment")}
                token={inputToken}
                tokens={tradableTokens}
                amountText={inputAmountText}
                setAmountText={setInputAmountText}
                balance={inputBalance}
                balancesByKey={balancesByTokenKey}
                balanceLoading={balancesLoading}
                disabled={swapBusy}
                onSelectTokenKey={selectPaymentToken}
              />
              <SwitchDirectionButton onClick={switchSides} disabled={swapBusy} />
              <TokenOutputBox
                title={t("swap.received")}
                token={outputToken}
                tokens={tradableTokens}
                quote={quote}
                balance={outputBalance}
                balancesByKey={balancesByTokenKey}
                balanceLoading={balancesLoading}
                quoteLoading={swapBusy}
                disabled={swapBusy}
                onSelectTokenKey={selectReceivedToken}
              />
            </div>

            <SwapDetails
              quote={quote}
              selectedPair={selectedPair}
              inputTokenCode={inputToken?.code ?? null}
              outputTokenCode={outputToken?.code ?? null}
              priceLabel={
                quote && inputToken && outputToken
                  ? `1 ${inputToken.code} ≈ ${priceForOneInput(selectedPair, inputSide, feeBps)} ${outputToken.code}`
                  : "-"
              }
              depthLabel={selectedPair ? depthLabel(selectedPair, inputSide) : "-"}
              feeBps={feeBps}
              slippageBpsText={slippageBpsText}
              onSlippageBpsTextChange={setSlippageBpsText}
            />

            {parsedInput.error && <div className="notice error">{parsedInput.error}</div>}
            {slippageBps == null && <div className="notice error">{t("swap.invalidSlippage")}</div>}
            {txResult && (
              <div className={txResult.startsWith(TX_FAIL_PREFIX) ? "notice error" : "notice success"}>
                {formatTxResult(txResult, t)}
              </div>
            )}

            <button
              className={`primary swapPrimary${swapBusy ? " is-loading" : ""}`}
              disabled={!wallet.session || !quote || swapBusy || Boolean(parsedInput.error) || slippageBps == null}
              onClick={executeSwap}>
              {swapBusy ? t("swap.submitting") : wallet.session ? t("swap.submit") : t("swap.connectFirst")}
            </button>

            <AuditNotice />
          </>
        )}
      </section>

      <section className="debugPanel">
        <h2>{t("zactions.title")}</h2>
        {marketsLoading ? (
          <ZactionsPreviewSkeleton />
        ) : (
          <pre>{quote ? JSON.stringify(buildSwapZActions({ quote, amountIn: parsedInput.amountIn }), null, 2) : t("zactions.empty")}</pre>
        )}
      </section>
      </div>
    </main>
  );
}

function formatTxResult(
  txResult: string,
  t: (key: MessageKey, vars?: Record<string, string>) => string,
): string {
  if (txResult === TX_SUCCESS) return t("swap.success");
  if (txResult.startsWith(TX_FAIL_PREFIX)) return `${t("swap.failedPrefix")}${txResult.slice(TX_FAIL_PREFIX.length)}`;
  return txResult;
}

function priceForOneInput(pair: ParsedPair | null, inputSide: PairSide, feeBps: bigint): string {
  if (!pair) return "-";
  const token = inputSide === 0 ? pair.token0 : pair.token1;
  const one = 10n ** BigInt(token.precision);
  try {
    const quote = quoteDirectSwap({ pair, inputSide, amountIn: one, feeBps, slippageBps: 0n });
    return unitsToHumanTrimmed(quote.amountOut, quote.outputToken.precision, 8);
  } catch {
    return "-";
  }
}

function depthLabel(pair: ParsedPair, inputSide: PairSide): string {
  const leftToken = inputSide === 0 ? pair.token0 : pair.token1;
  const rightToken = inputSide === 0 ? pair.token1 : pair.token0;
  const leftReserve = inputSide === 0 ? pair.reserve0 : pair.reserve1;
  const rightReserve = inputSide === 0 ? pair.reserve1 : pair.reserve0;
  return `${compactAsset(leftReserve, leftToken.precision, leftToken.code)} / ${compactAsset(rightReserve, rightToken.precision, rightToken.code)}`;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function formatWalletError(error: unknown, translate: (key: MessageKey) => string): string {
  const key = resolveWalletErrorKey(error);
  return key ? translate(key) : toErrorMessage(error);
}

