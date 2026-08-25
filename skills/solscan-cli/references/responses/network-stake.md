# Network Response Fields — Stake

Field-by-field description of the JSON the `network stake` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../network.md](../network.md) for flags/params). Shared envelope/error shape: [network.md](network.md#common-envelope).

This covers **daily network-wide total active stake** — as opposed to one account's stake positions ([`account stake`](../account.md)) or one account's stake rewards ([`account stake-rewards`](../account.md)).

## `stake`

`solscan network stake [--range <days>] [--from-date <YYYYMMDD>] [--to-date <YYYYMMDD>]`

`data.series` is an array with one row per day; every row carries both a SOL and a USD figure for the same quantity.

## Fields

| Field | Type | Description |
|-------|------|--------------|
| `series[].block_date` | string | Date of the row, `YYYY-MM-DD`. |
| `series[].block_time` | number | Unix timestamp (seconds) of `block_date`. |
| `series[].total_stake_sol` | number | Total active stake across the network on this date, denominated in **SOL** (already human-readable, not lamports). |
| `series[].total_stake_usd` | number | Same quantity, denominated in **USD** at that date's SOL price. |

**Example** (per Solscan's published reference):

```json
{
  "success": true,
  "data": {
    "updated_time": 1755590400,
    "lag_days": 1,
    "series": [
      {
        "block_date": "2026-08-17",
        "block_time": 1755388800,
        "total_stake_sol": 397612845.32,
        "total_stake_usd": 71582311204.55
      },
      {
        "block_date": "2026-08-18",
        "block_time": 1755475200,
        "total_stake_sol": 397845102.11,
        "total_stake_usd": 71659873321.02
      }
    ]
  },
  "metadata": {}
}
```

## Interpretation tips

- `total_stake_usd / total_stake_sol` reconstructs that day's implied SOL/USD price — useful when you need a same-day price reference without a separate `token price-history` call.
- This is **active** stake (currently delegated and earning rewards), not total SOL supply — expect it to track validator participation, not circulating supply.
- Day-over-day `total_stake_sol` changes are usually small and gradual (stake activates/deactivates over whole epochs, not instantly) — a large single-day jump is more likely a data anomaly than a real shift, worth double-checking against a second source before reporting it as fact.
