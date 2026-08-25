# Network Response Fields — Chain Info

Field-by-field description of the JSON the `network chain-info` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../network.md](../network.md) for flags/params). Shared envelope/error shape: [network.md](network.md#common-envelope).

This covers a **single live snapshot of overall chain state** — block height, epoch, absolute slot, cumulative transaction count — as opposed to every other `network` action, which returns a daily historical time series (see [network.md](network.md) for the other six).

## `chain-info`

`solscan network chain-info` — no options at all.

`data` is a **single flat object**, not an array and not the `series`-shaped envelope the other six `network` actions use.

## Fields

| Field | Type | Description |
|-------|------|--------------|
| `blockHeight` | number | Number of confirmed blocks — Solana's canonical block-height counter (never skips), same counter as `block detail`'s `block_height` field. |
| `currentEpoch` | number | The current epoch number. An epoch is ~2-3 days (432,000 slots) of validator scheduling/staking activity. |
| `absoluteSlot` | number | Total number of slots produced since genesis, **including empty/skipped slots** — always `>= blockHeight` since not every slot produces a block. |
| `transactionCount` | number | Cumulative total transactions processed on the chain from genesis through this block — a running total, not a daily figure (contrast with `network transactions`, which gives per-day counts). |

**Example** (per Solscan's published reference; live responses also carry an empty `metadata: {}` sibling not shown in Solscan's docs):

```json
{
  "success": true,
  "data": {
    "blockHeight": 93077733,
    "currentEpoch": 239,
    "absoluteSlot": 103591629,
    "transactionCount": 35454233802
  },
  "metadata": {}
}
```

## Interpretation tips

- Field names here are **camelCase** (`blockHeight`, `currentEpoch`), unlike every other field in this CLI's responses which use **snake_case** (`block_height` on `block detail`, `block_date`, `total_stake_sol`, etc.) — a direct pass-through of Solscan's raw upstream shape rather than the CLI normalizing it, so don't assume `block_height` will work if you're constructing a JSON-path/`jq` query by pattern-matching other commands.
- `absoluteSlot - blockHeight` gives the cumulative number of skipped slots since genesis — a rough, whole-chain-lifetime version of the per-day skip signal you'd get by comparing `network slots`' `value` against a slots-per-day estimate.
- There's no historical variant of this action — for a block height/slot/tx-count trend over time, combine `network slots` (daily block-production count) and `network transactions` (daily tx count) instead; `chain-info` only ever reflects "right now."
- Poll this instead of `block last --limit 1` when you only need the tip's slot/height number and don't need the full block metadata (blockhash, fee rewards, timestamp) that `block last`/`block detail` return.
