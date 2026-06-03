import { parseAssetQuantity, parseSymbol, type EosioSymbol } from "./eosioAsset";

export type DefiboxToken = {
  contract: string;
  symbol: string;
};

export type DefiboxPairRow = {
  id: number | string;
  token0: DefiboxToken;
  token1: DefiboxToken;
  reserve0: string;
  reserve1: string;
  liquidity_token: number | string;
  price0_last?: string;
  price1_last?: string;
  block_time_last?: string;
};

export type DefiboxConfigRow = {
  status: number | string;
  pair_id: number | string;
  trade_fee: number | string;
  protocol_fee: number | string;
  fee_account: string;
};

export type PairSide = 0 | 1;

export type ParsedPair = {
  id: string;
  token0: DefiboxToken & EosioSymbol;
  token1: DefiboxToken & EosioSymbol;
  reserve0: bigint;
  reserve1: bigint;
  liquidityToken: bigint;
  blockTimeLast?: string;
};

export type QuoteResult = {
  amountInAfterFee: bigint;
  amountOut: bigint;
  minOut: bigint;
  feeBps: bigint;
  inputToken: ParsedPair["token0"];
  outputToken: ParsedPair["token0"];
  inputReserve: bigint;
  outputReserve: bigint;
  memo: string;
};

export function parsePair(row: DefiboxPairRow): ParsedPair {
  const token0Symbol = parseSymbol(row.token0.symbol);
  const token1Symbol = parseSymbol(row.token1.symbol);
  const reserve0 = parseAssetQuantity(row.reserve0);
  const reserve1 = parseAssetQuantity(row.reserve1);

  if (reserve0.symbol !== token0Symbol.code) {
    throw new Error(`Pair ${String(row.id)} reserve0 symbol mismatch`);
  }
  if (reserve1.symbol !== token1Symbol.code) {
    throw new Error(`Pair ${String(row.id)} reserve1 symbol mismatch`);
  }

  return {
    id: String(row.id),
    token0: { ...row.token0, ...token0Symbol },
    token1: { ...row.token1, ...token1Symbol },
    reserve0: reserve0.units,
    reserve1: reserve1.units,
    liquidityToken: BigInt(String(row.liquidity_token ?? "0")),
    blockTimeLast: row.block_time_last,
  };
}

export function isTradablePair(pair: ParsedPair): boolean {
  return pair.reserve0 > 0n && pair.reserve1 > 0n && pair.liquidityToken > 0n;
}

export function getFeeBps(config: DefiboxConfigRow | null): bigint {
  if (!config) return 30n;
  return BigInt(String(config.trade_fee ?? "0")) + BigInt(String(config.protocol_fee ?? "0"));
}

export function quoteDirectSwap(params: {
  pair: ParsedPair;
  inputSide: PairSide;
  amountIn: bigint;
  feeBps: bigint;
  slippageBps: bigint;
}): QuoteResult {
  const { pair, inputSide, amountIn, feeBps, slippageBps } = params;
  if (amountIn <= 0n) {
    throw new Error("Amount must be greater than zero");
  }
  if (feeBps < 0n || feeBps >= 10_000n) {
    throw new Error("Invalid fee bps");
  }
  if (slippageBps < 0n || slippageBps >= 10_000n) {
    throw new Error("Invalid slippage bps");
  }

  const inputToken = inputSide === 0 ? pair.token0 : pair.token1;
  const outputToken = inputSide === 0 ? pair.token1 : pair.token0;
  const inputReserve = inputSide === 0 ? pair.reserve0 : pair.reserve1;
  const outputReserve = inputSide === 0 ? pair.reserve1 : pair.reserve0;

  if (inputReserve <= 0n || outputReserve <= 0n) {
    throw new Error("Pool has no liquidity");
  }

  const amountInAfterFee = (amountIn * (10_000n - feeBps)) / 10_000n;
  if (amountInAfterFee <= 0n) {
    throw new Error("Amount is too small after fees");
  }

  const amountOut = (outputReserve * amountInAfterFee) / (inputReserve + amountInAfterFee);
  if (amountOut <= 0n) {
    throw new Error("Amount is too small for this pool");
  }

  const minOut = (amountOut * (10_000n - slippageBps)) / 10_000n;
  const memo = `swap,${minOut.toString()},${pair.id}`;

  return {
    amountInAfterFee,
    amountOut,
    minOut,
    feeBps,
    inputToken,
    outputToken,
    inputReserve,
    outputReserve,
    memo,
  };
}
