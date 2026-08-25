# Network Response Fields — Slots

Field-by-field description of the JSON the `network slots` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../network.md](../network.md) for flags/params). Shared envelope/error shape: [network.md](network.md#common-envelope).

This covers **daily block-production counts** network-wide — as opposed to a single block's metadata ([block-detail.md](block-detail.md)) or the most recent blocks ([block-last.md](block-last.md)).

## `slots`

`solscan network slots [--range <days>] [--from-date <YYYYMMDD>] [--to-date <YYYYMMDD>]`

`data.series` is an array with one row per day; each row carries a single count.

## Fields

| Field | Type | Description |
|-------|------|--------------|
| `series[].block_date` | string | Date of the row, `YYYY-MM-DD`. |
| `series[].block_time` | number | Unix timestamp (seconds) of `block_date`. |
| `series[].value` | number | Number of blocks **produced** on this date — despite the action name "slots", this counts actual blocks, not raw leader slots (which include skipped slots with no block). |

**Example** (per Solscan's published reference):

```json
{
  "success": true,
  "data": {
    "updated_time": 1755590400,
    "lag_days": 1,
    "series": [
      { "block_date": "2026-08-17", "block_time": 1755388800, "value": 215847 },
      { "block_date": "2026-08-18", "block_time": 1755475200, "value": 216012 }
    ]
  },
  "metadata": {}
}
```

## Interpretation tips

- Solana produces roughly 1 slot every ~400ms (≈216,000 slots/day at 100% skip-free), so `value` in the low 200,000s per day is normal; a day noticeably below that reflects skipped slots (missed leader turns), not fewer transactions — this metric is about block production, not transaction volume (use `network transactions` for that).
- Pair with `network compute-units` (compute units ÷ blocks produced = average compute used per block) to gauge how "full" blocks are running, independent of raw transaction count.
