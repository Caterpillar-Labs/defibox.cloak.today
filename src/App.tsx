import { useEffect, useMemo, useState } from "react";
import { APP_CONFIG } from "./config";
import { fetchDefiboxConfig, fetchDefiboxPairs } from "./lib/chainApi";
import { getFeeBps, isTradablePair, parsePair, quoteDirectSwap, type DefiboxConfigRow, type PairSide, type ParsedPair, type QuoteResult } from "./lib/defibox";
import { compactAsset, decimalRatio, formatAsset, parseInputAmountToUnits, unitsToHumanTrimmed } from "./lib/eosioAsset";
import { buildSwapZActions, connectCloakWallet, disconnectCloakWallet, refreshAllBalances, submitSwap, type WalletState } from "./lib/zeos";
import { findBalanceInUnknownPayload } from "./lib/balances";
import { DefiboxLogo } from "./components/DefiboxLogo";

type LoadState = "idle" | "loading" | "ready" | "error";

export default function App() {
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

  async function connectWallet() {
    setWalletBusy(true);
    setWalletError(null);
    try {
      const connected = await connectCloakWallet(() => {
        setWallet({ session: null, handle: null });
        setBalancesPayload(null);
        setTxResult(null);
        setWalletError("ZEOS Link connection closed.");
      });
      setWallet(connected);
      const balances = await refreshAllBalances(connected.session!);
      setBalancesPayload(balances);
    } catch (e) {
      setWalletError(toErrorMessage(e));
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
      setWalletError(toErrorMessage(e));
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
        setTxResult("Swap submitted successfully.");
        setTimeout(() => void refreshBalances(), 6000);
      } else {
        throw new Error(toErrorMessage(result.error ?? result.detail ?? result));
      }
    } catch (e) {
      setTxResult(`Swap failed: ${toErrorMessage(e)}`);
    } finally {
      setSwapBusy(false);
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <h1>
            <DefiboxLogo
              width={64}
              style={{ display: "inline-block", verticalAlign: "middle" }}
            />
            Defibox CLOAKed Swap
          </h1>
          <p className="subtle">Direct-pair swaps through <code>swap.defi</code> with full privacy. Because #PrivacyMatters.</p>
        </div>
        <div className="walletBox">
          <div className="walletStatus">
            <span className={wallet.session ? "dot ok" : "dot"} />
            {wallet.session ? `Connected: ${wallet.handle ?? "CLOAK wallet"}` : "Wallet not connected"}
          </div>
          <button className="secondary" disabled={walletBusy} onClick={wallet.session ? refreshBalances : connectWallet}>
            {walletBusy ? "Working..." : wallet.session ? "Refresh balances" : "Connect CLOAK"}
          </button>
          {wallet.session && (
            <button className="secondary danger" disabled={walletBusy || swapBusy} onClick={disconnectWallet}>
              Disconnect
            </button>
          )}
          {walletError && <p className="errorText">{walletError}</p>}
        </div>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <strong>Swap</strong>
          <button className="ghost" onClick={loadMarkets} disabled={loadState === "loading"}>
            {loadState === "loading" ? "Loading..." : "Refresh markets"}
          </button>
        </div>

        {error && <div className="notice error">{error}</div>}

        <label className="fieldLabel">Market</label>
        <select className="select" value={selectedPairId} onChange={(e) => setSelectedPairId(e.target.value)}>
          {pairs.map((pair) => (
            <option key={pair.id} value={pair.id}>
              #{pair.id} {pair.token0.code}/{pair.token1.code} · {pair.token0.contract}/{pair.token1.contract}
            </option>
          ))}
        </select>

        <div className="swapCard">
          <TokenAmountBox
            title="Payment"
            token={inputToken}
            amountText={inputAmountText}
            setAmountText={setInputAmountText}
            balance={inputBalance}
          />
          <button className="switchButton" onClick={switchSides} aria-label="Switch swap direction">
            ⇅
          </button>
          <TokenOutputBox title="Received" token={outputToken} quote={quote} balance={outputBalance} />
        </div>

        <div className="details">
          <div className="detailRow">
            <span>Price</span>
            <strong>{quote && inputToken && outputToken ? `1 ${inputToken.code} ≈ ${priceForOneInput(selectedPair, inputSide, feeBps)} ${outputToken.code}` : "-"}</strong>
          </div>
          <div className="detailRow">
            <span>Pool depth</span>
            <strong>{selectedPair ? depthLabel(selectedPair, inputSide) : "-"}</strong>
          </div>
          <div className="detailRow">
            <span>Fee</span>
            <strong>{feeBps.toString()} bps</strong>
          </div>
          <div className="detailRow">
            <span>Min output memo units</span>
            <strong>{quote ? quote.minOut.toString() : "-"}</strong>
          </div>
          <div className="detailRow">
            <label htmlFor="slippage">Slippage protection</label>
            <div className="slippageInput">
              <input id="slippage" value={slippageBpsText} onChange={(e) => setSlippageBpsText(e.target.value)} inputMode="numeric" />
              <span>bps</span>
            </div>
          </div>
          <div className="memoBox">{quote ? quote.memo : "swap,<min_out_units>,<pair_id>"}</div>
        </div>

        {parsedInput.error && <div className="notice error">{parsedInput.error}</div>}
        {slippageBps == null && <div className="notice error">Invalid slippage bps.</div>}
        {txResult && <div className={txResult.startsWith("Swap failed") ? "notice error" : "notice success"}>{txResult}</div>}

        <button className="primary" disabled={!wallet.session || !quote || swapBusy || Boolean(parsedInput.error) || slippageBps == null} onClick={executeSwap}>
          {swapBusy ? "Submitting..." : wallet.session ? "Swap with CLOAK" : "Connect wallet first"}
        </button>
      </section>

      <section className="debugPanel">
        <h2>Current zactions preview</h2>
        <pre>{quote ? JSON.stringify(buildSwapZActions({ quote, amountIn: parsedInput.amountIn }), null, 2) : "Enter an amount to build zactions."}</pre>
      </section>
    </main>
  );
}

function TokenAmountBox(props: {
  title: string;
  token: ReturnType<typeof nullableToken>;
  amountText: string;
  setAmountText: (value: string) => void;
  balance: bigint | null;
}) {
  const { title, token, amountText, setAmountText, balance } = props;
  return (
    <div className="tokenBox">
      <div className="tokenBoxTop">
        <span>{title}</span>
        <span>{token && balance != null ? `Bal: ${compactAsset(balance, token.precision, token.code)}` : "Bal: -"}</span>
      </div>
      <div className="tokenMain">
        <TokenBadge token={token} />
        <input className="amountInput" value={amountText} onChange={(e) => setAmountText(e.target.value)} inputMode="decimal" placeholder="0" />
      </div>
    </div>
  );
}

function TokenOutputBox(props: { title: string; token: ReturnType<typeof nullableToken>; quote: QuoteResult | null; balance: bigint | null }) {
  const { title, token, quote, balance } = props;
  const amount = quote && token ? unitsToHumanTrimmed(quote.amountOut, token.precision, 8) : "0";
  return (
    <div className="tokenBox">
      <div className="tokenBoxTop">
        <span>{title}</span>
        <span>{token && balance != null ? `Bal: ${compactAsset(balance, token.precision, token.code)}` : "Bal: -"}</span>
      </div>
      <div className="tokenMain">
        <TokenBadge token={token} />
        <div className="outputAmount">{amount}</div>
      </div>
    </div>
  );
}

function TokenBadge({ token }: { token: ReturnType<typeof nullableToken> }) {
  return (
    <div className="tokenBadge">
      <span className="tokenIcon">{token?.code.slice(0, 1) ?? "?"}</span>
      <span>
        <strong>{token?.code ?? "-"}</strong>
        <small>{token?.contract ?? "-"}</small>
      </span>
    </div>
  );
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

function nullableToken() {
  return null as null | ParsedPair["token0"];
}
