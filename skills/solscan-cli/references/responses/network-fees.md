# Network Response Fields — Fees

Field-by-field description of the JSON the `network fees` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../network.md](../network.md) for flags/params). Shared envelope/error shape: [network.md](network.md#common-envelope).

This covers **daily network-wide transaction fee totals** — as opposed to one transaction's fee ([transaction-fees.md](transaction-fees.md), via `transaction fees`).

## `fees`

`solscan network fees [--range <days>] [--from-time <YYYYMMDD>] [--to-time <YYYYMMDD>]`

`data.series` is an array with one row per day; each row splits fees into base vs. priority, each in both SOL and USD, plus the combined total.

## Fields

| Field | Type | Description |
|-------|------|--------------|
| `series[].block_date` | string | Date of the row, `YYYY-MM-DD`. |
| `series[].block_time` | number | Unix timestamp (seconds) of `block_date`. |
| `series[].base_fee` | number | Total **base fee** collected network-wide on this date, in **SOL**. The fixed, protocol-set per-signature fee — does not vary with network congestion. |
| `series[].base_fee_usd` | number | Same, in **USD**. |
| `series[].priority_fee` | number | Total **priority fee** collected on this date, in **SOL**. The optional congestion-priced fee (`compute unit price × units`) users add to land transactions faster. |
| `series[].priority_fee_usd` | number | Same, in **USD**. |
| `series[].total_fee` | number | `base_fee + priority_fee` for this date, in **SOL**. |
| `series[].total_fee_usd` | number | `base_fee_usd + priority_fee_usd` for this date, in **USD**. |

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
        "base_fee": 5123.44,
        "base_fee_usd": 921834.12,
        "priority_fee": 8452.09,
        "priority_fee_usd": 1520450.63,
        "total_fee": 13575.53,
        "total_fee_usd": 2442284.75
      },
      {
        "block_date": "2026-08-18",
        "block_time": 1755475200,
        "base_fee": 5209.71,
        "base_fee_usd": 936721.9,
        "priority_fee": 8611.28,
        "priority_fee_usd": 1548865.44,
        "total_fee": 13820.99,
        "total_fee_usd": 2485587.34
      }
    ]
  },
  "metadata": {}
}
```

## Interpretation tips

- `priority_fee` rising faster than `base_fee` (a growing share of `total_fee`) signals network congestion — users are paying more to jump the queue — while `base_fee` alone tracks raw transaction volume/count more directly (it scales with `network transactions`' counts, not with congestion).
- All four money fields are already in SOL or USD, not lamports/raw units — no `1e9` or decimals conversion needed, unlike `block detail`'s `fee_rewards` (lamports).
- To compare against per-transaction economics, divide a day's `total_fee` by that same day's `network transactions --filter total` value — gives an average fee per transaction for the network as a whole.
