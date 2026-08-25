# Network Response Fields

Field-by-field description of the JSON each `network <action>` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../network.md](../network.md) for flags/params).

This index only holds the envelope shared by every action. Field-level docs live in topic files:

| File | Covers | Actions |
|------|--------|---------|
| [network-chain-info.md](network-chain-info.md) | Live chain snapshot — block height, epoch, slot, tx count | `chain-info` |
| [network-transactions.md](network-transactions.md) | Daily transaction counts, total/vote/non-vote split | `transactions` |
| [network-stake.md](network-stake.md) | Daily total active stake (SOL + USD) | `stake` |
| [network-fees.md](network-fees.md) | Daily transaction fees, base + priority (SOL + USD) | `fees` |
| [network-slots.md](network-slots.md) | Daily block-production count | `slots` |
| [network-defi-activity.md](network-defi-activity.md) | Daily DEX trade/trader/volume counts | `defi-activity` |
| [network-compute-units.md](network-compute-units.md) | Daily compute units consumed | `compute-units` |

## Common envelope

Every `network` action wraps its payload the same way:

| Field | Type | Description |
|-------|------|--------------|
| `success` | boolean | `true` on `200 OK`. |
| `data` | object | The actual payload — shaped per action. `chain-info` returns a flat snapshot object (see [network-chain-info.md](network-chain-info.md)); the other six all share the `updated_time`/`lag_days`/`series` shape below. |
| `metadata` | object | Present on every observed response (all seven actions) as an empty object (`{}`). Not documented by Solscan's published reference and no populated example has been observed — treat as reserved/unused rather than a source of data today. |

For the six **time-series** actions (everything except `chain-info`), `data` always has this shape:

| Field | Type | Description |
|-------|------|--------------|
| `data.updated_time` | number | Unix timestamp (seconds) of when this response's underlying data was generated — not the request time. |
| `data.lag_days` | number | How many days behind real time the underlying data is (observed: `1`, i.e. "yesterday and earlier" is complete, today's row may be partial or absent). |
| `data.series` | array of object | One row per day, oldest first. Per-action fields documented in the topic files above; every row always has `block_date` and `block_time`. |

Every row in `data.series` shares these two fields regardless of action:

| Field | Type | Description |
|-------|------|--------------|
| `block_date` | string | Date of the row, `YYYY-MM-DD` (e.g. `"2026-08-17"`). |
| `block_time` | number | Unix timestamp (seconds) of `block_date` (midnight UTC). |

`chain-info` has no `updated_time`/`lag_days`/`series` at all — it's a single live snapshot, not a time series; see [network-chain-info.md](network-chain-info.md) for its (unrelated) field names.

On failure, `success` is `false` and `data`/`metadata` are replaced by an `errors` object — but the exact shape depends on *which* failure:

| Field | Type | Description |
|-------|------|--------------|
| `errors.code` | number | API error code, e.g. `1100` observed for a validation error (distinct from the HTTP status). |
| `errors.message` | string | Human-readable description, e.g. `"Validation Error: \"filter\" must be one of [total, vote, nonvote_success, nonvote_fail, all]"` or `"Validation Error: \"range\" must be one of [30, 90, 180, 365]"`. |

One failure mode does **not** use that shape: a missing/invalid API key returns `{"error_message": "Token is missing"}` (flat, no `success`/`errors` wrapper) with HTTP `401` — the CLI's error handling checks for `error_message` as well as `errors.message` so either shape prints a useful `Server message:` line.

Every action here is a network-wide aggregate with no address/token/program scoping option — use `account`/`token`/`program` resources instead for a per-entity breakdown. `--from-date`/`--to-date` take priority over `--range` when both are passed — see [../network.md](../network.md#shared-time-window-options). All USD figures (`total_stake_usd`, `*_fee_usd`, `volume_usd`) and SOL figures (`total_stake_sol`, `base_fee`, `priority_fee`, `total_fee`) across the topic files below are already in those units, **not lamports/raw base units** — contrast with `block detail`'s `fee_rewards`, which is in lamports.
