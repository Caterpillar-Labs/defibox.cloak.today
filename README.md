# defibox.cloak.today

Minimal CLOAK-only Defibox swap demo.

This repo demonstrates how a browser app can connect to the CLOAK wallet through `zeos-link` and perform direct swaps against the existing Defibox AMM contract on EOS/Vaulta.

The goal is intentionally narrow: show a clean, readable example of private CLOAK wallet interaction with a real third-party EOSIO smart contract.

## What this demo supports

* CLOAK wallet connect through `zeos-link`
* private wallet balance loading
* direct Defibox pair discovery from `swap.defi`
* direct pair swaps only
* BigInt-only asset and quote math
* local HTTPS dev server for ZEOS Link wallet connect

## What this demo does not support

* no Defibox router paths
* no multi-hop swaps
* no add/remove liquidity
* no pool creation
* no Anchor / TokenPocket / native EOSIO wallet support
* no auth-token based private dApp actions
* no generic public EOSIO action calls from CLOAK transactions

LP deposit/withdrawal is intentionally out of scope for this version. Defibox liquidity deposit requires an explicit `swap.defi::deposit(owner, pair_id)` action after the two token transfers. `zeos-link` supports CLOAK zactions, not Anchor/WharfKit-style `{ actions: [...] }` transactions, and Defibox is not integrated with CLOAK auth-token private action handling.

## Requirements

* Node.js 20+
* CLOAK wallet with ZEOS Link running locally
* Browser access to the local ZEOS Link WebSocket service
* Browser accepts the local HTTPS certificate warning during development

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open:

```text
https://127.0.0.1:5173
```

The first Vite HTTPS run uses a local self-signed certificate. Your browser will likely show a warning. Accept it for local development.

## Environment

`.env.example` contains the default EOS/Vaulta mainnet settings:

```text
VITE_CHAIN_API=https://eos.eosusa.io
VITE_SWAP_CONTRACT=swap.defi
VITE_PROTOCOL_CONTRACT=zeosprotocol
VITE_VAULT_CONTRACT=thezeosvault
VITE_ALIAS_AUTHORITY=thezeosproxy@public
VITE_ZEOS_LINK_URL=wss://127.0.0.1:9367
```

If wallet login fails, check these values first.

## How it works

### 1. Connect to CLOAK

The app uses `zeos-link` directly:

```ts
const session = new ZSession(zeosLinkUrl);

const login = await session.login(
  {
    chain_id,
    protocol_contract,
    vault_contract,
    alias_authority,
  },
  onClose,
);
```

After login, the app uses the returned session for balance requests and private transactions.

### 2. Load private balances

The app queries private fungible-token balances through:

```ts
await session.allBalances(true, false, false);
```

The CLOAK wallet currently returns fungible balances in this format:

```json
{
  "fts": [
    "700.0000 A@core.vaulta",
    "6.2069 USDT@tethertether",
    "36.8274 EOS@eosio.token",
    "182848.4539 CLOAK@thezeostoken"
  ]
}
```

The app parses these strings into token contract, symbol, precision, and integer units.

### 3. Load Defibox markets

The app mirrors the relevant Defibox frontend table reads:

```json
{
  "json": true,
  "code": "swap.defi",
  "scope": "swap.defi",
  "table": "config",
  "limit": 10
}
```

and:

```json
{
  "json": true,
  "code": "swap.defi",
  "scope": "swap.defi",
  "table": "pairs",
  "lower_bound": 0,
  "limit": -1
}
```

The `config` table provides the current fee settings. The `pairs` table provides available direct markets and reserves.

### 4. Quote direct swaps

The app only quotes direct swaps against one Defibox pair.

All math is done with `BigInt`. Do not use JavaScript `number` or floating point for asset amounts.

The quote model is:

```text
total_fee_bps = trade_fee + protocol_fee

amount_in_after_fee =
  amount_in * (10000 - total_fee_bps) / 10000

amount_out =
  reserve_out * amount_in_after_fee
  / (reserve_in + amount_in_after_fee)
```

The current Defibox config uses:

```text
trade_fee = 20
protocol_fee = 10
total_fee_bps = 30
```

So the effective swap fee is currently `0.30%`.

### 5. Submit the CLOAK swap

A normal Defibox direct swap is triggered by a token transfer to `swap.defi`:

```text
memo = "swap,<min_out_units>,<pair_id>"
```

Example:

```text
swap,11615,12
```

For a 4-decimal output token, `11615` means `1.1615`.

The CLOAK version wraps this as a private transaction:

```ts
[
  {
    name: "spend",
    data: {
      contract: inputTokenContract,
      change_to: "$SELF",
      publish_change_note: true,
      to: [
        {
          to: "swap.defi",
          quantity: inputQuantity,
          memo: "swap,<min_out_units>,<pair_id>",
          publish_note: true
        }
      ]
    }
  },
  {
    name: "mint",
    data: {
      to: "$SELF",
      contract: outputTokenContract,
      quantity: exactExpectedOutputQuantity,
      memo: "Defibox swap",
      from: "swap.defi",
      publish_note: true
    }
  }
]
```

Then the app submits:

```ts
const result = await session.transact(zactions, true, true, {
  timeoutMs: 120_000,
});
```

Always inspect `result.status`.

## Exact-output requirement

The CLOAK `mint` action expects the exact resulting amount.

That means the locally predicted Defibox output must match the real Defibox output exactly. If pool reserves move after the quote was calculated, the transaction may fail. This is expected behavior.

Slippage protection still matters for Defibox, but it does not change the expected output math. It only sets the minimum acceptable output in the transfer memo.

In this demo:

* `exactExpectedOutputQuantity` is used for the CLOAK mint.
* `min_out_units` is used only as Defibox swap protection.
* stale quotes should be refreshed before retrying.

## Why there is no routing

Defibox supports route paths such as:

```text
swap,<min_out_units>,4-293
```

This demo intentionally ignores those.

Only direct pair swaps are supported:

```text
swap,<min_out_units>,<pair_id>
```

This keeps the quote math deterministic, readable, and suitable for demonstrating CLOAK wallet integration.

## Project structure

```text
src/
  config.ts              Environment-backed app config
  App.tsx                Demo UI and app state
  lib/
    balances.ts          CLOAK balance parsing
    defibox.ts           Defibox table parsing and BigInt quote math
    eosioAsset.ts        EOSIO asset parsing/formatting helpers
    chain.ts             get_table_rows helper
    zeos.ts              zeos-link connect/balance/transact helpers
```

## Development commands

```bash
npm run dev
npm run build
npm run preview
```

## Security notes

This is a demo app, not a full production wallet UI.

Important constraints:

* quotes can become stale if reserves move;
* CLOAK mint amounts must be exact;
* all asset math must stay integer-only;
* unsupported Defibox pools with zero reserves should be ignored;
* router paths and LP operations are intentionally excluded;
* transaction success must be checked through the returned transaction status.

## Future work

Possible future additions:

* direct pool filtering / token search
* better transaction history display
* configurable slippage
* LP withdraw support if the required action model becomes available
* LP deposit support once arbitrary public EOSIO action calls are safely supported by the CLOAK protocol/wallet flow

## License

TBD.
