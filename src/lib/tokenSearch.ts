// src/lib/tokenSearch.ts
import type { SwapToken } from "./swapTokens";

export function filterSwapTokens(tokens: SwapToken[], query: string): SwapToken[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return tokens;

  return tokens.filter(
    (token) =>
      token.code.toLowerCase().includes(normalized) || token.contract.toLowerCase().includes(normalized),
  );
}
