export type EosioSymbol = {
  precision: number;
  code: string;
};

export type AssetAmount = {
  units: bigint;
  precision: number;
  symbol: string;
};

export function parseSymbol(symbol: string): EosioSymbol {
  const parts = symbol.split(",");
  if (parts.length !== 2) {
    throw new Error(`Invalid EOSIO symbol: ${symbol}`);
  }

  const precision = Number(parts[0]);
  if (!Number.isInteger(precision) || precision < 0 || precision > 18) {
    throw new Error(`Invalid symbol precision: ${symbol}`);
  }

  const code = parts[1]?.trim();
  if (!code || !/^[A-Z0-9]{1,12}$/.test(code)) {
    throw new Error(`Invalid symbol code: ${symbol}`);
  }

  return { precision, code };
}

export function parseAssetQuantity(quantity: string): AssetAmount {
  const trimmed = quantity.trim();
  const spaceIndex = trimmed.lastIndexOf(" ");
  if (spaceIndex <= 0) {
    throw new Error(`Invalid asset quantity: ${quantity}`);
  }

  const amount = trimmed.slice(0, spaceIndex).replace(",", ".");
  const symbol = trimmed.slice(spaceIndex + 1).trim();
  if (!/^\d+(\.\d+)?$/.test(amount)) {
    throw new Error(`Invalid asset amount: ${quantity}`);
  }

  const [intPart, fracPart = ""] = amount.split(".");
  const units = BigInt(`${intPart}${fracPart}`.replace(/^0+(?=\d)/, "") || "0");
  return { units, precision: fracPart.length, symbol };
}

export function parseInputAmountToUnits(input: string, precision: number): bigint {
  const normalized = input.trim().replace(",", ".");
  if (!normalized) return 0n;
  if (!/^\d+(\.\d*)?$/.test(normalized)) {
    throw new Error("Invalid amount");
  }

  const [intPart, fracPartRaw = ""] = normalized.split(".");
  const fracPart = fracPartRaw.padEnd(precision, "0");
  if (fracPartRaw.length > precision) {
    throw new Error(`Too many decimals. This token supports ${precision}.`);
  }

  return BigInt(`${intPart}${fracPart}`.replace(/^0+(?=\d)/, "") || "0");
}

export function formatUnits(units: bigint, precision: number): string {
  const negative = units < 0n;
  const abs = negative ? -units : units;
  const raw = abs.toString().padStart(precision + 1, "0");
  const intPart = precision > 0 ? raw.slice(0, -precision) : raw;
  const fracPart = precision > 0 ? raw.slice(-precision) : "";
  return `${negative ? "-" : ""}${precision > 0 ? `${intPart}.${fracPart}` : intPart}`;
}

export function formatAsset(units: bigint, precision: number, symbol: string): string {
  return `${formatUnits(units, precision)} ${symbol}`;
}

export function compactAsset(units: bigint, precision: number, symbol: string, maxDecimals = 4): string {
  const full = formatUnits(units, precision);
  if (precision <= maxDecimals) return `${full} ${symbol}`;
  const [whole, frac = ""] = full.split(".");
  const trimmed = frac.slice(0, maxDecimals).replace(/0+$/, "");
  return `${trimmed ? `${whole}.${trimmed}` : whole} ${symbol}`;
}

export function unitsToHumanTrimmed(units: bigint, precision: number, maxDecimals = 8): string {
  const full = formatUnits(units, precision);
  const [whole, frac = ""] = full.split(".");
  if (!frac) return whole;
  const trimmed = frac.slice(0, maxDecimals).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

export function decimalRatio(numerator: bigint, numeratorPrecision: number, denominator: bigint, denominatorPrecision: number, decimals = 8): string {
  if (denominator <= 0n) return "-";
  const scale = 10n ** BigInt(decimals);
  const adjustedNumerator = numerator * 10n ** BigInt(denominatorPrecision);
  const adjustedDenominator = denominator * 10n ** BigInt(numeratorPrecision);
  const value = (adjustedNumerator * scale) / adjustedDenominator;
  return trimDecimal(formatUnits(value, decimals));
}

function trimDecimal(value: string): string {
  if (!value.includes(".")) return value;
  return value.replace(/0+$/, "").replace(/\.$/, "");
}
