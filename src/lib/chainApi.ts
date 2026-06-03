import { APP_CONFIG } from "../config";
import type { DefiboxConfigRow, DefiboxPairRow } from "./defibox";

export type TableRowsResponse<T> = {
  rows: T[];
  more: boolean;
  next_key?: string;
};

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${APP_CONFIG.chainApi}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`RPC ${response.status}: ${text || response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function fetchDefiboxConfig(): Promise<DefiboxConfigRow | null> {
  const result = await postJson<TableRowsResponse<DefiboxConfigRow>>("/v1/chain/get_table_rows", {
    json: true,
    code: APP_CONFIG.swapContract,
    scope: APP_CONFIG.swapContract,
    table: "config",
    lower_bound: "",
    upper_bound: "",
    index_position: 1,
    key_type: "",
    limit: 10,
    reverse: false,
    show_payer: false,
  });

  return result.rows[0] ?? null;
}

export async function fetchDefiboxPairs(): Promise<DefiboxPairRow[]> {
  const result = await postJson<TableRowsResponse<DefiboxPairRow>>("/v1/chain/get_table_rows", {
    json: true,
    code: APP_CONFIG.swapContract,
    scope: APP_CONFIG.swapContract,
    table: "pairs",
    lower_bound: 0,
    upper_bound: "",
    index_position: 1,
    key_type: "",
    limit: -1,
    reverse: false,
    show_payer: false,
  });

  return result.rows;
}
