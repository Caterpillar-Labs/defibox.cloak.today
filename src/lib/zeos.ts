// src/lib/zeos.ts
import ZSession from "zeos-link";
import type { BalancesResult, TransactResult, ZAction } from "zeos-link";
import { APP_CONFIG } from "../config";
import type { QuoteResult } from "./defibox";
import { formatAsset } from "./eosioAsset";
import type { MessageKey } from "./i18n/messages";

type ZSessionLike = InstanceType<typeof ZSession>;

const WALLET_CONNECTION_ERROR_PATTERNS = [
  /websocket/i,
  /econnrefused/i,
  /connection refused/i,
  /failed to connect/i,
  /could not connect/i,
];

export type WalletState = {
  session: ZSessionLike | null;
  handle: string | null;
};

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "";
  }
}

export function resolveWalletErrorKey(error: unknown): MessageKey | null {
  const normalized = extractErrorMessage(error).trim().toLowerCase();
  if (!normalized) return null;

  if (WALLET_CONNECTION_ERROR_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "wallet.notRunning";
  }

  if (normalized.includes("login declined")) {
    return "wallet.loginDeclined";
  }

  if (normalized.includes("connection closed") || normalized.includes("link connection closed")) {
    return "wallet.connectionClosed";
  }

  return null;
}

export async function connectCloakWallet(onClose?: () => void): Promise<WalletState> {
  const session = new ZSession(APP_CONFIG.zeosLinkUrl);
  const login = await session.login({
    chain_id: APP_CONFIG.chainId,
    protocol_contract: APP_CONFIG.protocolContract,
    vault_contract: APP_CONFIG.vaultContract,
    alias_authority: APP_CONFIG.aliasAuthority,
  }, onClose);

  if (!login) {
    throw new Error("Login declined by wallet");
  }

  return { session, handle: session.handle() };
}

export async function refreshAllBalances(session: ZSessionLike): Promise<BalancesResult> {
  return await session.allBalances(true, false, false);
}

export async function disconnectCloakWallet(session: ZSessionLike): Promise<void> {
  await (session as { logout?: () => void | Promise<void> }).logout?.();
}

export function buildSwapZActions(params: {
  quote: QuoteResult;
  amountIn: bigint;
}): ZAction[] {
  const { quote, amountIn } = params;
  const inputQuantity = formatAsset(amountIn, quote.inputToken.precision, quote.inputToken.code);
  const outputQuantity = formatAsset(quote.amountOut, quote.outputToken.precision, quote.outputToken.code);

  return [
    {
      name: "spend",
      data: {
        contract: quote.inputToken.contract,
        change_to: "$SELF",
        publish_change_note: true,
        to: [
          {
            to: APP_CONFIG.swapContract,
            quantity: inputQuantity,
            memo: quote.memo,
            publish_note: true,
          },
        ],
      },
    },
    {
      name: "mint",
      data: {
        to: "$SELF",
        contract: quote.outputToken.contract,
        quantity: outputQuantity,
        memo: "Defibox swap",
        from: APP_CONFIG.swapContract,
        publish_note: true,
      },
    },
  ];
}

export async function submitSwap(session: ZSessionLike, zactions: ZAction[]): Promise<TransactResult> {
  return await session.transact(zactions, true, true, { timeoutMs: 120_000 });
}
