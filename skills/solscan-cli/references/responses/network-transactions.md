# Network Response Fields — Transactions

Field-by-field description of the JSON the `network transactions` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../network.md](../network.md) for flags/params). Shared envelope/error shape: [network.md](network.md#common-envelope).

This covers **daily network-wide transaction counts** — total, vote, and non-vote success/fail — as opposed to a single transaction's detail ([transaction-detail.md](transaction-detail.md)) or the most recent raw transactions ([transaction-last.md](transaction-last.md)).

## `transactions`

`solscan network transactions [--filter <all|total|vote|nonvote_success|nonvote_fail>] [--range <days>] [--from-time <YYYYMMDD>] [--to-time <YYYYMMDD>]`

`data.series` is an array with one row per day. Its shape depends on `--filter`:

- **`--filter all`** (default): each row carries all four counts.
- **any other single value** (`total`, `vote`, `nonvote_success`, `nonvote_fail`): each row carries only `value`, holding that one metric.

## Fields

| Field | Type | Present when | Description |
|-------|------|---------------|--------------|
| `data.filter` | string | always | Echoes the `--filter` value that was applied (defaults to `"all"` if omitted). Use this to know which shape the rows are in without inspecting a row first. |
| `series[].block_date` | string | always | Date of the row, `YYYY-MM-DD`. |
| `series[].block_time` | number | always | Unix timestamp (seconds) of `block_date`. |
| `series[].total` | number | `--filter all` only | Total transactions (vote + non-vote, success + fail) on this date. |
| `series[].vote` | number | `--filter all` only | Vote transactions on this date — consensus voting, not user activity. |
| `series[].nonvote_success` | number | `--filter all` only | Successful non-vote transactions on this date — the closest single number to "real" user/app activity. |
| `series[].nonvote_fail` | number | `--filter all` only | Failed non-vote transactions on this date (reverted/errored, still consumed fees and a slot). |
| `series[].value` | number | `--filter` is a single metric | The selected metric's count for this date — same meaning as the correspondingly-named field above. |

**Example** (`--filter all`, per Solscan's published reference, `metadata` confirmed via live testing):

```json
{
  "success": true,
  "data": {
    "updated_time": 1755590400,
    "lag_days": 1,
    "filter": "all",
    "series": [
      {
        "block_date": "2026-08-17",
        "block_time": 1755388800,
        "total": 68542193,
        "vote": 45231087,
        "nonvote_success": 21983412,
        "nonvote_fail": 1327694
      },
      {
        "block_date": "2026-08-18",
        "block_time": 1755475200,
        "total": 69102344,
        "vote": 45602198,
        "nonvote_success": 22187530,
        "nonvote_fail": 1312616
      }
    ]
  },
  "metadata": {}
}
```

**Example** (`--filter vote`, live capture, trimmed to 2 rows):

```json
{
  "success": true,
  "data": {
    "updated_time": 1787640554,
    "lag_days": 1,
    "filter": "vote",
    "series": [
      { "block_date": "2026-07-26", "block_time": 1785024000, "value": 140423872 },
      { "block_date": "2026-07-27", "block_time": 1785110400, "value": 140697059 }
    ]
  },
  "metadata": {}
}
```

## Interpretation tips

- `total = vote + nonvote_success + nonvote_fail` for every row under `--filter all` — a quick sanity check when reconciling numbers.
- Vote transactions typically dominate the total (roughly ~65% in observed data) — don't mistake `total` for "user activity"; use `nonvote_success` (or `nonvote_success + nonvote_fail`) for that instead.
- `nonvote_fail` is not an error condition to alarm on by itself — failed transactions (e.g. slippage-reverted swaps, expired blockhashes) are normal background noise on Solana; watch for a *sudden spike* relative to `nonvote_success` rather than any nonzero value.
- To get every metric as separate single-value series in one pass, call `--filter all` once rather than looping the command four times with each single-metric `--filter` value.
