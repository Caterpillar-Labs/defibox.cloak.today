// src/lib/swapTokens.ts
import type { PairSide, ParsedPair } from "./defibox";

export type SwapToken = ParsedPair["token0"];

export function tokenKey(token: { contract: string; code: string }): string {
  return `${token.contract}::${token.code}`;
}

export function tokensEqual(a: { contract: string; code: string }, b: { contract: string; code: string }): boolean {
  return a.contract === b.contract && a.code === b.code;
}

export function collectTradableTokens(pairs: ParsedPair[]): SwapToken[] {
  const map = new Map<string, SwapToken>();
  for (const pair of pairs) {
    for (const token of [pair.token0, pair.token1]) {
      const key = tokenKey(token);
      if (!map.has(key)) {
        map.set(key, token);
      }
    }
  }

  return [...map.values()].sort((left, right) => {
    const codeCompare = left.code.localeCompare(right.code);
    return codeCompare !== 0 ? codeCompare : left.contract.localeCompare(right.contract);
  });
}

export function resolveTokenByKey(tokens: SwapToken[], key: string): SwapToken | null {
  return tokens.find((token) => tokenKey(token) === key) ?? null;
}

export function findDirectPair(
  pairs: ParsedPair[],
  tokenIn: SwapToken,
  tokenOut: SwapToken,
): { pair: ParsedPair; inputSide: PairSide } | null {
  for (const pair of pairs) {
    if (tokensEqual(pair.token0, tokenIn) && tokensEqual(pair.token1, tokenOut)) {
      return { pair, inputSide: 0 };
    }
    if (tokensEqual(pair.token1, tokenIn) && tokensEqual(pair.token0, tokenOut)) {
      return { pair, inputSide: 1 };
    }
  }
  return null;
}

export function findPairForInputToken(
  pairs: ParsedPair[],
  inputToken: SwapToken,
  preferredOutputToken?: SwapToken | null,
): { pair: ParsedPair; inputSide: PairSide } | null {
  if (preferredOutputToken) {
    const direct = findDirectPair(pairs, inputToken, preferredOutputToken);
    if (direct) return direct;
  }

  for (const pair of pairs) {
    if (tokensEqual(pair.token0, inputToken)) {
      return { pair, inputSide: 0 };
    }
    if (tokensEqual(pair.token1, inputToken)) {
      return { pair, inputSide: 1 };
    }
  }

  return null;
}

export function findPairForOutputToken(
  pairs: ParsedPair[],
  outputToken: SwapToken,
  preferredInputToken?: SwapToken | null,
): { pair: ParsedPair; inputSide: PairSide } | null {
  if (preferredInputToken) {
    const direct = findDirectPair(pairs, preferredInputToken, outputToken);
    if (direct) return direct;
  }

  for (const pair of pairs) {
    if (tokensEqual(pair.token0, outputToken)) {
      return { pair, inputSide: 1 };
    }
    if (tokensEqual(pair.token1, outputToken)) {
      return { pair, inputSide: 0 };
    }
  }

  return null;
}
