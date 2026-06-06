// src/lib/chainMetadata.ts
import {
  createFetchZfsChainClient,
  fetchAllTableRows,
  fetchFileContentZFilesystemWithEncoding,
  fetchFilesZFilesystem,
  parseZFilesystemAssetUri,
  type ZfsChainClient,
} from "@caterpillar-labs/zeos-zfilesystem";
import { APP_CONFIG } from "../config";

export type ChainTokenMeta = {
  symbol: string;
  icon: string;
};

export type DiscoveredNetwork = {
  id: string;
  chainName: string;
  chainId: string;
  apiNodes: string[];
  zfilesystemContract: string;
};

export type AliasDiscoveryResult = {
  network: DiscoveredNetwork;
  networksById: Record<string, DiscoveredNetwork>;
  chainTokens: ChainTokenMeta[];
};

const EOS_ALIAS_FALLBACK_NODES = [
  "https://eos.eosusa.io",
  "https://eos.eosphere.io",
  "https://api.eostitan.com",
  "https://mainnet.genereos.io",
  "https://api.main.alohaeos.com",
  "https://eos.api.eosnation.io",
  "https://api.eosrio.io",
  "https://mainnet.eosio.sg",
  "https://mainnet.eosamsterdam.net",
] as const;

const zfsClientCache = new Map<string, ZfsChainClient>();
const resolvedIconCache = new Map<string, string>();
const pendingIconByKey = new Map<string, Promise<string>>();

function aliasTokensTableSymbolToCode(symbol: string): string {
  const trimmed = symbol.trim();
  const lastComma = trimmed.lastIndexOf(",");
  if (lastComma >= 0) {
    const code = trimmed.slice(lastComma + 1).trim();
    if (code) return code;
  }
  return trimmed;
}

function parseTokenRows(raw: unknown[]): ChainTokenMeta[] {
  const out: ChainTokenMeta[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const tokenRow = row as { symbol?: string; icon?: string };
    const rawSymbol = typeof tokenRow.symbol === "string" ? tokenRow.symbol.trim() : "";
    const symbol = aliasTokensTableSymbolToCode(rawSymbol);
    if (!symbol) continue;
    out.push({
      symbol,
      icon: typeof tokenRow.icon === "string" ? tokenRow.icon : "",
    });
  }
  return out;
}

function parseNetworkRow(row: unknown): DiscoveredNetwork | null {
  if (!row || typeof row !== "object") return null;
  const networkRow = row as {
    chain_name?: string;
    chain_id?: string;
    chain_api_nodes?: string[];
    zfilesystem?: string;
    enabled?: boolean | number;
  };

  const enabled = networkRow.enabled ?? true;
  if (enabled !== true && enabled !== 1) return null;

  const chainName = typeof networkRow.chain_name === "string" ? networkRow.chain_name.trim() : "";
  const chainId = typeof networkRow.chain_id === "string" ? networkRow.chain_id.trim() : "";
  if (!chainName || !chainId) return null;

  const apiNodes = Array.isArray(networkRow.chain_api_nodes)
    ? networkRow.chain_api_nodes.map((node) => (typeof node === "string" ? node.trim() : "")).filter(Boolean)
    : [];
  if (apiNodes.length === 0) return null;

  return {
    id: chainName,
    chainName,
    chainId,
    apiNodes,
    zfilesystemContract: typeof networkRow.zfilesystem === "string" ? networkRow.zfilesystem.trim() : "",
  };
}

function pickNetworkForChainId(networks: DiscoveredNetwork[], chainId: string): DiscoveredNetwork | null {
  const normalized = chainId.trim().toLowerCase();
  return networks.find((network) => network.chainId.toLowerCase() === normalized) ?? networks[0] ?? null;
}

function discoveryRpcNodes(): string[] {
  const nodes = new Set<string>([APP_CONFIG.chainApi, ...EOS_ALIAS_FALLBACK_NODES]);
  return [...nodes];
}

function zfsClientForNetwork(network: DiscoveredNetwork): ZfsChainClient {
  const rpcUrl = network.apiNodes[0]?.trim();
  if (!rpcUrl) throw new Error("Network has no RPC node");

  const cacheKey = `${network.id}:${rpcUrl}`;
  const cached = zfsClientCache.get(cacheKey);
  if (cached) return cached;

  const client = createFetchZfsChainClient({ rpcUrl, cacheKey });
  zfsClientCache.set(cacheKey, client);
  return client;
}

function resolveNetworkForChain(
  chainName: string,
  currentNetwork: DiscoveredNetwork,
  networksById: Record<string, DiscoveredNetwork>,
): DiscoveredNetwork {
  const chain = chainName.trim().toLowerCase();
  if (!chain || currentNetwork.chainName.trim().toLowerCase() === chain) return currentNetwork;

  for (const network of Object.values(networksById)) {
    if (network.chainName.trim().toLowerCase() === chain) return network;
  }
  return currentNetwork;
}

function mimeFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "svg":
      return "image/svg+xml";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

function isDirectImageUrl(url: string): boolean {
  return (
    url.startsWith("/") ||
    url.startsWith("data:") ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
  );
}

export async function discoverAliasMetadata(): Promise<AliasDiscoveryResult> {
  const aliasContract = APP_CONFIG.aliasContract;
  let lastError: unknown;

  for (const rpcUrl of discoveryRpcNodes()) {
    try {
      const client = createFetchZfsChainClient({ rpcUrl, cacheKey: `${rpcUrl}:${aliasContract}` });
      const [networkRows, tokenRows] = await Promise.all([
        fetchAllTableRows(client, { code: aliasContract, scope: aliasContract, table: "networks" }),
        fetchAllTableRows(client, { code: aliasContract, scope: aliasContract, table: "tokens" }),
      ]);

      const networks = networkRows.map(parseNetworkRow).filter((network): network is DiscoveredNetwork => network !== null);
      const network = pickNetworkForChainId(networks, APP_CONFIG.chainId);
      if (!network) throw new Error("No matching network row for configured chain id");

      return {
        network,
        networksById: Object.fromEntries(networks.map((entry) => [entry.id, entry])),
        chainTokens: parseTokenRows(tokenRows),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError ?? "Alias discovery failed"));
}

export async function resolveTokenIconUrl(
  rawUrl: string,
  currentNetwork: DiscoveredNetwork,
  networksById: Record<string, DiscoveredNetwork>,
): Promise<string> {
  const source = rawUrl.trim();
  if (!source) return "";
  if (isDirectImageUrl(source)) return source;

  const parsed = parseZFilesystemAssetUri(source);
  if (!parsed?.filename.trim()) return "";

  const cacheKey = `${parsed.chainName}::${parsed.contract}::${parsed.owner}::${parsed.filename}`;
  const cached = resolvedIconCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const pending = pendingIconByKey.get(cacheKey);
  if (pending) return pending;

  const run = (async () => {
    try {
      const network = resolveNetworkForChain(parsed.chainName, currentNetwork, networksById);
      const client = zfsClientForNetwork(network);
      const rows = await fetchFilesZFilesystem({ contract: parsed.contract, owner: parsed.owner, client });
      const row = rows.find((entry) => entry.filename === parsed.filename);
      if (!row?.chunks.length) {
        resolvedIconCache.set(cacheKey, "");
        return "";
      }

      const decoded = await fetchFileContentZFilesystemWithEncoding({
        contract: parsed.contract,
        owner: parsed.owner,
        filename: parsed.filename,
        chunkIds: row.chunks,
        client,
      });
      const blobUrl = URL.createObjectURL(
        new Blob([new Uint8Array(decoded.bytes)], { type: mimeFromFilename(parsed.filename) }),
      );
      resolvedIconCache.set(cacheKey, blobUrl);
      return blobUrl;
    } catch {
      resolvedIconCache.set(cacheKey, "");
      return "";
    } finally {
      pendingIconByKey.delete(cacheKey);
    }
  })();

  pendingIconByKey.set(cacheKey, run);
  return run;
}

export async function resolveTokenIconForSymbol(
  symbolCode: string,
  iconsBySymbol: Map<string, string>,
  currentNetwork: DiscoveredNetwork,
  networksById: Record<string, DiscoveredNetwork>,
): Promise<string> {
  const code = symbolCode.trim();
  if (!code) return "";

  const rawIcon = iconsBySymbol.get(code) ?? iconsBySymbol.get(code.toUpperCase()) ?? "";
  if (!rawIcon) return "";

  return resolveTokenIconUrl(rawIcon, currentNetwork, networksById);
}
