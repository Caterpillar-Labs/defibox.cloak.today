# defibox.cloak.today

Minimal CLOAK-only Defibox swap demo.

Scope is intentionally narrow:

- direct Defibox swaps only
- no router paths / no multi-hop
- no LP add/remove
- no Anchor / TokenPocket support
- BigInt-only asset math
- local HTTPS dev server for ZEOS Link wallet connect

## Requirements

- Node.js 20+
- CLOAK wallet / ZEOS Link running locally
- Browser accepts the local dev HTTPS certificate warning

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

The first Vite HTTPS run uses a local self-signed certificate. Your browser will likely show a warning; accept it for local development.

## Important defaults

`.env.example` contains EOS/Vaulta mainnet defaults:

```text
VITE_CHAIN_API=https://eos.eosusa.io
VITE_SWAP_CONTRACT=swap.defi
VITE_PROTOCOL_CONTRACT=zeosprotocol
VITE_VAULT_CONTRACT=thezeosvault
VITE_ALIAS_AUTHORITY=thezeosproxy@public
VITE_ZEOS_LINK_URL=wss://127.0.0.1:9367
```

If the wallet rejects login, check the protocol/vault/alias values first.

## Transaction model

For a direct swap the app submits this CLOAK zaction pattern:

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

The mint quantity is exact. If Defibox output changes because reserves moved after quoting, the CLOAK transaction should fail. Refresh the quote and retry.
