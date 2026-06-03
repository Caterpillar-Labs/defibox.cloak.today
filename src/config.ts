export const APP_CONFIG = {
  chainId: import.meta.env.VITE_CHAIN_ID || "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
  chainApi: removeTrailingSlash(import.meta.env.VITE_CHAIN_API || "https://eos.eosusa.io"),
  swapContract: import.meta.env.VITE_SWAP_CONTRACT || "swap.defi",
  protocolContract: import.meta.env.VITE_PROTOCOL_CONTRACT || "zeosprotocol",
  vaultContract: import.meta.env.VITE_VAULT_CONTRACT || "thezeosvault",
  aliasAuthority: import.meta.env.VITE_ALIAS_AUTHORITY || "thezeosproxy@public",
  zeosLinkUrl: import.meta.env.VITE_ZEOS_LINK_URL || "wss://127.0.0.1:9367",
  defaultPairId: import.meta.env.VITE_DEFAULT_PAIR_ID || "12",
  defaultSlippageBps: import.meta.env.VITE_DEFAULT_SLIPPAGE_BPS || "300",
};

function removeTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
