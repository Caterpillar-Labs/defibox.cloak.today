import { parseAssetQuantity } from "./eosioAsset";
import type { DefiboxToken } from "./defibox";

export function findBalanceInUnknownPayload(payload: unknown, token: DefiboxToken): bigint | null {
  const found: bigint[] = [];
  visit(payload, token, found);
  return found.length > 0 ? found[0]! : null;
}

function visit(value: unknown, token: DefiboxToken, found: bigint[]): void {
  if (found.length > 0) return;
  if (value == null) return;

  if (Array.isArray(value)) {
    for (const entry of value) visit(entry, token, found);
    return;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const contract = getString(obj.contract) ?? getString(obj.token_contract) ?? getString(obj.tokenContract);
    const quantity = getString(obj.quantity) ?? getString(obj.balance) ?? getString(obj.amount);

    if (contract === token.contract && quantity) {
      try {
        const parsed = parseAssetQuantity(quantity);
        const symbolCode = token.symbol.split(",")[1];
        if (parsed.symbol === symbolCode) {
          found.push(parsed.units);
          return;
        }
      } catch {
        // Ignore non-EOSIO asset strings in unknown wallet payloads.
      }
    }

    for (const nested of Object.values(obj)) visit(nested, token, found);
  }
}

function getString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}
