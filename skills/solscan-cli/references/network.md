# Network Reference

```bash
solscan network <action> [options]
```

Network-wide data across the whole Solana chain — not scoped to one account/token/program. Six of the seven actions return a **daily time series** (one row per day, `block_date`/`block_time`) over a window controlled by `--range` or `--from-time`/`--to-time`; `chain-info` is the exception — a single **live snapshot** with no time window at all (see below).

**Host note**: these actions hit `public-api.solscan.io` instead of `pro-api.solscan.io/v2.0` (see [../../src/api.js](../../../src/api.js) `makeNetworkAnalyticsRequest`), but still require the same Solscan Pro API key via the `token` header — "public" in Solscan's docs describes the hostname, not that it's unauthenticated. A missing/invalid key still fails with `401`.

| Action | Description | Required | Optional |
|--------|-------------|----------|----------|
| `chain-info` | Live chain snapshot: block height, epoch, absolute slot, total tx count | — | — |
| `transactions` | Daily transaction counts (total/vote/non-vote success/fail) | — | `--filter`, `--range`, `--from-time`, `--to-time` |
| `stake` | Daily total active stake, in SOL and USD | — | `--range`, `--from-time`, `--to-time` |
| `fees` | Daily transaction fees (base + priority), in SOL and USD | — | `--range`, `--from-time`, `--to-time` |
| `slots` | Daily count of blocks produced | — | `--range`, `--from-time`, `--to-time` |
| `defi-activity` | Daily DEX activity: trades, traders, volume, active DEX count | — | `--range`, `--from-time`, `--to-time` |
| `compute-units` | Daily compute units consumed by transactions | — | `--range`, `--from-time`, `--to-time` |

## Shared time-window options

Every `network` action except `chain-info` accepts the same three time-window flags:

- **`--range <days>`** — `30 | 90 | 180 | 365` (default `90`). Counts back from today.
- **`--from-time <YYYYMMDD>`** / **`--to-time <YYYYMMDD>`** — pass **both together** to pin an explicit start/end date, e.g. `--from-time 20240701 --to-time 20240715`. This is the `YYYYMMDD` integer format (e.g. `20260814`), **not** unix seconds — different convention from most other `--from-time`/`--to-time` flags in this CLI (see [../SKILL.md](../SKILL.md) Core Concepts), matching `token price-history` and `market volume` instead.

**`--from-time`/`--to-time` take priority over `--range` when both are passed** — if you supply `--from-time`/`--to-time` alongside `--range`, the explicit date window wins and `--range` is silently ignored, matching the flag description in `--help`.

## Option details

**`chain-info`**: no options at all — always returns the current snapshot, nothing to page through or filter. Full field-by-field breakdown: [responses/network-chain-info.md](responses/network-chain-info.md).

**`transactions`**: `--filter` selects the returned shape — `all` (default) returns `total`/`vote`/`nonvote_success`/`nonvote_fail` per day; any other single value (`total`, `vote`, `nonvote_success`, `nonvote_fail`) returns just that metric as `value` per day instead. Full field-by-field breakdown: [responses/network-transactions.md](responses/network-transactions.md).

**`stake`**: no action-specific options beyond the shared time-window flags. Full field-by-field breakdown: [responses/network-stake.md](responses/network-stake.md).

**`fees`**: no action-specific options beyond the shared time-window flags. Full field-by-field breakdown: [responses/network-fees.md](responses/network-fees.md).

**`slots`**: no action-specific options beyond the shared time-window flags. Full field-by-field breakdown: [responses/network-slots.md](responses/network-slots.md).

**`defi-activity`**: no action-specific options beyond the shared time-window flags. Full field-by-field breakdown: [responses/network-defi-activity.md](responses/network-defi-activity.md).

**`compute-units`**: no action-specific options beyond the shared time-window flags. Full field-by-field breakdown: [responses/network-compute-units.md](responses/network-compute-units.md).

## Response Fields

Field-by-field description of each action's JSON response (types, meaning, edge cases): [responses/network.md](responses/network.md) (index + shared envelope) → per-action files linked above.

## Examples

```bash
solscan network chain-info
solscan network transactions --range 90
solscan network transactions --filter vote --range 30
solscan network stake --range 180
solscan network fees --range 30 --no-json
solscan network slots --range 365
solscan network defi-activity --range 90
solscan network compute-units --range 30
```
