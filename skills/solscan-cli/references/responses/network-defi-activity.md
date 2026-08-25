# Network Response Fields — DeFi Activity

Field-by-field description of the JSON the `network defi-activity` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../network.md](../network.md) for flags/params). Shared envelope/error shape: [network.md](network.md#common-envelope).

This covers **daily network-wide DEX/DeFi activity** — as opposed to one account's DeFi activity ([account-activity.md](account-activity.md), via `account defi`) or one token's DeFi activity (`token defi`).

## `defi-activity`

`solscan network defi-activity [--range <days>] [--from-time <YYYYMMDD>] [--to-time <YYYYMMDD>]`

`data.series` is an array with one row per day.

## Fields

| Field | Type | Description |
|-------|------|--------------|
| `series[].block_date` | string | Date of the row, `YYYY-MM-DD`. |
| `series[].block_time` | number | Unix timestamp (seconds) of `block_date`. |
| `series[].trade_count` | number | Number of trades executed across all tracked DEX platforms on this date. |
| `series[].trader_count` | number | Number of **unique** traders (wallets) active across all tracked DEX platforms on this date — not comparable additively across days (the same trader can appear in multiple days' counts). |
| `series[].volume_usd` | number | Total trading volume across all tracked DEX platforms on this date, in **USD**. |
| `series[].active_dex_count` | number | Number of distinct DEX platform/source combinations that had at least one trade on this date. |

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
        "trade_count": 4832910,
        "trader_count": 612384,
        "volume_usd": 2841923044.12,
        "active_dex_count": 47
      },
      {
        "block_date": "2026-08-18",
        "block_time": 1755475200,
        "trade_count": 4901255,
        "trader_count": 618972,
        "volume_usd": 2903481120.87,
        "active_dex_count": 48
      }
    ]
  },
  "metadata": {}
}
```

## Interpretation tips

- `volume_usd / trade_count` gives an average trade size for the day — a rising average with flat `trade_count` suggests larger/whale trades rather than broader retail participation, and vice versa.
- `trader_count` is much smaller than `trade_count` (one trader typically makes several trades a day) — don't confuse the two when reporting "how many people traded" vs. "how much trading happened."
- `active_dex_count` is a coverage/health metric more than an activity metric — a sudden drop can indicate a data-source outage on Solscan's side rather than an actual reduction in on-chain DEX activity; cross-check against `trade_count`/`volume_usd` before concluding DEX usage dropped.
- Cross-reference with [`program list --sort-by num_txs`](../program.md) or [`program popular`](../program.md) to see *which* programs/platforms are driving a given day's totals — this endpoint only gives the network-wide aggregate, not a per-platform breakdown.
