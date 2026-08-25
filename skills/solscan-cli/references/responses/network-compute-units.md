# Network Response Fields — Compute Units

Field-by-field description of the JSON the `network compute-units` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../network.md](../network.md) for flags/params). Shared envelope/error shape: [network.md](network.md#common-envelope).

This covers **daily network-wide compute unit consumption** — the total execution budget spent by all transactions, distinct from fee amounts ([network-fees.md](network-fees.md)) even though priority fees are computed from compute unit price × units.

## `compute-units`

`solscan network compute-units [--range <days>] [--from-date <YYYYMMDD>] [--to-date <YYYYMMDD>]`

`data.series` is an array with one row per day; each row carries a single count.

## Fields

| Field | Type | Description |
|-------|------|--------------|
| `series[].block_date` | string | Date of the row, `YYYY-MM-DD`. |
| `series[].block_time` | number | Unix timestamp (seconds) of `block_date`. |
| `series[].value` | number | Total compute units consumed by all transactions network-wide on this date. Solana's per-block ceiling is 48,000,000 CU (as of the 2024 raise) and each transaction defaults to a 200,000 CU budget unless it explicitly requests more/less via `SetComputeUnitLimit` — this field is the sum actually *consumed*, not the sum requested. |

**Example** (per Solscan's published reference):

```json
{
  "success": true,
  "data": {
    "updated_time": 1755590400,
    "lag_days": 1,
    "series": [
      { "block_date": "2026-08-17", "block_time": 1755388800, "value": 184320981234 },
      { "block_date": "2026-08-18", "block_time": 1755475200, "value": 186104552011 }
    ]
  },
  "metadata": {}
}
```

## Interpretation tips

- `value / (network slots' value × 48,000,000)` for the same day gives an approximate network-wide block-fullness ratio — how saturated compute capacity was, a more precise congestion signal than transaction count alone since transactions vary widely in compute cost.
- Divide `value` by that day's `network transactions --filter nonvote_success` (or `total`) count to get an average compute units per transaction — useful for spotting a shift toward heavier on-chain programs (e.g. more complex DeFi/AMM instructions) even when transaction *count* is flat.
- This metric moving up while `network fees`' `priority_fee` also rises is expected together (more CU demand → higher competition for block space → higher priority fees); if only one moves, treat it as a data-quality flag worth double-checking rather than assuming a real economic shift.
