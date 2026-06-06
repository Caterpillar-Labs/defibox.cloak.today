// src/providers/ChainMetadataProvider.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  discoverAliasMetadata,
  resolveTokenIconForSymbol,
  type ChainTokenMeta,
  type DiscoveredNetwork,
} from "../lib/chainMetadata";
import { resolveTokenIconPath } from "../lib/tokenIcon";

type ChainMetadataPhase = "idle" | "loading" | "ready" | "error";

type ChainMetadataContextValue = {
  resolveTokenIcon: (symbolCode: string) => Promise<string>;
  expectsTokenIcon: (symbolCode: string) => boolean;
};

const ChainMetadataContext = createContext<ChainMetadataContextValue | null>(null);

function buildIconsBySymbol(chainTokens: readonly ChainTokenMeta[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const token of chainTokens) {
    const symbol = token.symbol.trim();
    const icon = token.icon.trim();
    if (!symbol || !icon) continue;
    map.set(symbol, icon);
    map.set(symbol.toUpperCase(), icon);
  }
  return map;
}

export function ChainMetadataProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<ChainMetadataPhase>("idle");
  const [network, setNetwork] = useState<DiscoveredNetwork | null>(null);
  const [networksById, setNetworksById] = useState<Record<string, DiscoveredNetwork>>({});
  const [chainTokens, setChainTokens] = useState<ChainTokenMeta[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setPhase("loading");
      try {
        const result = await discoverAliasMetadata();
        if (cancelled) return;
        setNetwork(result.network);
        setNetworksById(result.networksById);
        setChainTokens(result.chainTokens);
        setPhase("ready");
      } catch {
        if (cancelled) return;
        setNetwork(null);
        setNetworksById({});
        setChainTokens([]);
        setPhase("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const iconsBySymbol = useMemo(() => buildIconsBySymbol(chainTokens), [chainTokens]);

  const resolveTokenIcon = useCallback(
    async (symbolCode: string): Promise<string> => {
      if (!network) return "";
      return resolveTokenIconForSymbol(symbolCode, iconsBySymbol, network, networksById);
    },
    [iconsBySymbol, network, networksById],
  );

  const expectsTokenIcon = useCallback(
    (symbolCode: string): boolean => {
      if (resolveTokenIconPath(symbolCode)) return true;

      const code = symbolCode.trim();
      if (!code) return false;
      if (phase === "loading" || phase === "idle") return true;
      if (phase !== "ready") return false;

      return Boolean(iconsBySymbol.get(code) ?? iconsBySymbol.get(code.toUpperCase()));
    },
    [iconsBySymbol, phase],
  );

  const value = useMemo(
    (): ChainMetadataContextValue => ({
      resolveTokenIcon,
      expectsTokenIcon,
    }),
    [resolveTokenIcon, expectsTokenIcon],
  );

  return <ChainMetadataContext.Provider value={value}>{children}</ChainMetadataContext.Provider>;
}

export function useChainMetadata(): ChainMetadataContextValue {
  const context = useContext(ChainMetadataContext);
  if (!context) {
    throw new Error("useChainMetadata must be used within ChainMetadataProvider");
  }
  return context;
}
