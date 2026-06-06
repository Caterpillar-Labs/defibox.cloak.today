# Defibox CLOAK Swap Demo - Project Knowledge

> **Last updated:** 2026-06-06 (zeos-zfilesystem token icons)

## Multi-thread feature workflow

| Item                           | Path                                                 |
| ------------------------------ | ---------------------------------------------------- |
| Cursor rule                    | `.cursor/rules/feature-thread-workflow.mdc`          |
| Temp prompt packs (gitignored) | `.cursor/feature-prompts/<feature-slug>/`            |
| Phase prompt template          | `.cursor/templates/feature-phase-prompt.template.md` |

## Audit workflow (multi-worker, read-only)

| Item           | Path                                                         |
| -------------- | ------------------------------------------------------------ |
| Cursor rule    | `.cursor/rules/feature-thread-workflow.mdc` (Audit workflow) |
| Audit packs    | `.cursor/feature-prompts/audit-<scope>/` (`packType: audit`) |
| Audit template | `.cursor/templates/audit-phase-prompt.template.md`           |
| Checklist      | **Audit checklist** in `frontend-engineering-partner.mdc`    |

**Second validation round:** mandatory pass including diff stats - `frontend-engineering-partner.mdc`.

**Rules evolution:** repeatable delivery gaps → update `.cursor/rules/` in the same session.

**Search-first / no boilerplate:** search before new files; no duplicate logic - **Search-first, minimal code, no duplication** in `frontend-engineering-partner.mdc`.

**Questions vs implementation:** questions → explain first; no code unless explicitly requested - see **Questions vs implementation** in `frontend-engineering-partner.mdc`.

**Git staging:** always stage `.cursor/` when modified; **feature-scoped commits** when ~8+ files or 2+ domains - see **Git Workflow (human gate)** in `frontend-engineering-partner.mdc`.

**Same reasoning bar:** feature-thread or simplified workflow - same partner mindset - see **Same reasoning bar (all workflows)** in `frontend-engineering-partner.mdc`.

## Git workflow

- No automatic `git push` or `git commit` (see **Git Workflow** in `.cursor/rules/frontend-engineering-partner.mdc`)
- **Build gate (blocking):** `npm run build` must succeed in session before commit prep, `git commit`, or `git push` on app code; chat line `Build: pass` / `Build: fail`
- After implementation: selective `git add`, breakdown + proposed commit message(s); human validates before commit/push
- **Feature-scoped commits:** ~8+ files or 2+ domains → one commit per feature/domain

> **Maintenance:** After any change to architecture, dependencies, directory layout, lib modules, blockchain integration, or conventions, update this file in the same session. Keep `.cursor/rules/project-knowledge.mdc` body in sync. When onboarding or ops change (install, scripts, env vars, `.gitignore`), update root `README.md` in the same session.

## Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Runtime    | Node.js 20+                                     |
| Framework  | Vite 6, React 19, TypeScript 5                  |
| Styling    | Plain CSS (`src/styles.css`)                    |
| Blockchain | `zeos-link` (CLOAK / ZSession only)             |
| Chain API  | EOS HTTP API (`get_table_rows`) via `chainApi.ts` |
| Dev server | Vite HTTPS (`@vitejs/plugin-basic-ssl`) on 5173 |

### package.json scripts

- `dev` - Vite dev server at `https://127.0.0.1:5173`
- `build` - `tsc --noEmit && vite build`
- `preview` - production preview on HTTPS

### Key dependencies

`react`, `react-dom`, `zeos-link`, `@caterpillar-labs/zeos-zfilesystem`, `@wharfkit/antelope`, `vite`, `@vitejs/plugin-react`, `@vitejs/plugin-basic-ssl`, `typescript`

## Directory layout

```
src/
  main.tsx              React entry
  App.tsx               Demo UI and page state (orchestration)
  config.ts             Vite env-backed app config
  styles.css            Global styles
  components/           Reusable UI (render only)
    DefiboxLogo.tsx
    dropdown/
      Dropdown.tsx      Searchable Cloak-themed select (ported from aapp)
  types/
    dropdownTypes.ts    Dropdown option/props types
  constants/
    connectedInputGroupConstants.ts  Embedded input group colors (Dropdown)
  providers/
    ChainMetadataProvider.tsx  Alias networks/tokens discovery + token icon resolver
    LanguageProvider.tsx
  lib/                  Business logic (no UI)
    chainApi.ts         Defibox table reads (config, pairs)
    chainMetadata.ts    Alias `networks`/`tokens` reads + zfilesystem icon decode
    defibox.ts          Pair parsing, BigInt quote math, tradability
    eosioAsset.ts       EOSIO asset parse/format helpers
    balances.ts         CLOAK balance payload parsing
    zeos.ts             zeos-link connect, balances, swap zactions, transact
    tokenIcon.ts        Fallback gradient colors + local static icon paths
    connectedInputGroupStyles.ts  Connected input group border styles (Dropdown)
```

No `services/`, `hooks/`, or `types/` folders yet. As the demo grows, prefer:

- **`src/lib/`** - chain reads, Defibox math, zeos-link, pure helpers
- **`src/hooks/`** - React state + orchestration calling `lib/`
- **`src/components/`** - render only
- **`src/types/`** - shared types when they outgrow inline exports in `lib/`

## Architecture rules

- **`src/lib/`** - fetch on-chain data, build zactions, parse assets; no React imports
- **`src/components/`** - render only; no direct `session.transact` except thin shells fed by props
- **`src/App.tsx`** - page orchestration today; extract `useDefiboxSwapPage` when logic grows
- **Separation** - keep Defibox quote math in `defibox.ts`, wallet flow in `zeos.ts`, table reads in `chainApi.ts`

## Blockchain integration

### Scope

- **CLOAK wallet only** via `zeos-link` / ZEOS Link WebSocket
- **No** Anchor, TokenPocket, or WharfKit session support in this demo
- **No** auth-token private dApp actions
- **Direct pair swaps only** on `swap.defi` - no router paths, no LP deposit/withdraw

### Contracts (env defaults)

| Env var                   | Default              | Role                          |
| ------------------------- | -------------------- | ----------------------------- |
| `VITE_CHAIN_API`          | `https://eos.eosusa.io` | Chain HTTP API             |
| `VITE_SWAP_CONTRACT`      | `swap.defi`          | Defibox AMM                   |
| `VITE_PROTOCOL_CONTRACT`  | `zeosprotocol`       | CLOAK protocol                |
| `VITE_VAULT_CONTRACT`     | `thezeosvault`       | CLOAK vault                   |
| `VITE_ALIAS_AUTHORITY`    | `thezeosproxy@public`| Login alias authority         |
| `VITE_ALIAS_CONTRACT`     | `thezeosproxy`       | Alias table scope (`networks`, `tokens`) |
| `VITE_ZEOS_LINK_URL`      | `wss://127.0.0.1:9367` | ZEOS Link WebSocket        |

### Token icons (zfilesystem demo)

1. On app load, `chainMetadata.ts` reads `thezeosproxy::networks` and `thezeosproxy::tokens` via `@caterpillar-labs/zeos-zfilesystem` (`createFetchZfsChainClient`, `fetchAllTableRows`).
2. `ChainMetadataProvider` exposes `resolveTokenIcon(symbol)` to UI components.
3. Token `icon` fields may be HTTP URLs or `zfilesystem` asset URIs; URIs are decoded on-chain to blob URLs in `chainMetadata.ts`.
4. `TokenIcon` falls back to local static assets (`tokenIcon.ts`) then gradient letter badges.

### Wallet flow

1. `connectCloakWallet` - `ZSession.login` with chain + protocol config
2. `refreshAllBalances` - `session.allBalances(true, false, false)`
3. `buildSwapZActions` - `spend` + `mint` zactions for Defibox direct swap
4. `submitSwap` - `session.transact(zactions, true, true, { timeoutMs: 120_000 })`

### Defibox swap model

- Read `swap.defi::config` and `swap.defi::pairs`
- Quote: BigInt-only constant-product with `trade_fee + protocol_fee` bps
- Transfer memo: `swap,<min_out_units>,<pair_id>` (direct pair id only)
- CLOAK `mint` quantity must match **exact** predicted output (stale quotes fail)

### Asset math (mandatory)

- All amounts as **`BigInt`** integer units
- Never use JavaScript `number` or floating point for token amounts
- Format/display via `eosioAsset.ts` helpers only

## Demo constraints (do not expand without explicit ask)

- No multi-hop / router swaps (`swap,<min>,<path>` paths)
- No add/remove liquidity or pool creation
- No generic public EOSIO action calls from CLOAK transactions
- LP deposit needs `swap.defi::deposit` after transfers - out of scope until CLOAK supports it safely

## Code conventions

- All code, logs, comments in **English**
- UI copy is English-only (no i18n layer in this repo)
- First line of every new/modified code file: repo-relative path comment (see `frontend-engineering-partner.mdc`)
- **Hyphens only:** ASCII `-`; never em dash in copy, strings, comments, or rules

## Validation

```bash
npm run build
```

Manual smoke: connect CLOAK, load markets, quote swap, inspect zactions preview, submit swap (testnet/mainnet as configured).
