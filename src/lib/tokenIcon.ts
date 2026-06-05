// src/lib/tokenIcon.ts
const TOKEN_ICON_COLORS: Record<string, { from: string; to: string }> = {
  EOS: { from: "#f59e0b", to: "#ea580c" },
  A: { from: "#2563eb", to: "#1d4ed8" },
  TLOS: { from: "#7c3aed", to: "#5b21b6" },
  USDT: { from: "#22c55e", to: "#16a34a" },
  USDC: { from: "#3b82f6", to: "#2563eb" },
};

export function resolveTokenIconColors(symbolCode: string): { from: string; to: string } {
  const code = symbolCode.trim().toUpperCase();
  return TOKEN_ICON_COLORS[code] ?? { from: "var(--accent)", to: "#06b6d4" };
}

export function resolveTokenIconPath(symbolCode: string): string | null {
  const code = symbolCode.trim().toUpperCase();
  if (code === "TLOS") return "/assets/images/symbols/TLOS.png";
  return null;
}
