# Program Response Fields — `analytics`

Shared envelope: [program.md](program.md#common-envelope).

`solscan program analytics --address <PROGRAM_ADDRESS> --range <7|30>`

`data` is a **single object** — aggregate totals for the requested `--range` window, plus a `data` array broken out **per day** within that window (yes, the daily breakdown array is itself named `data`, nested one level inside the top-level `data` object — don't confuse the two when extracting fields).

Top-level `data`:

| Field | Type | Description |
|-------|------|--------------|
| `program_id` | string | Echoes the queried `--address`. |
| `days` | number | Echoes the queried `--range` (`7` or `30`). |
| `data` | array of object | Per-day breakdown, oldest-to-newest observed in Solscan's own example — one entry per day in the window. See below. |
| `num_trans` | number | **Total** transactions touching this program across the whole `--range` window (sum of `data[].num_trans`). |
| `num_trans_success` | number | **Total** successful transactions across the whole window (sum of `data[].num_trans_success`). |
| `interaction_volume` | number | **Total** interaction volume (USD) across the whole window (sum of `data[].interaction_volume`). |
| `last_24h_active_users` | number | Distinct active users in the trailing 24 hours — a rolling figure, not tied to `--range`. |
| `active_users_change_24` | string | 24-hour active-user change vs. the previous day, as a **percent, string-encoded** (e.g. `"-19.00"` = -19%). Solscan's schema declares this field's type as `number`, but both their own example and live responses return it as a string — parse it (`parseFloat`) before doing math on it. |

Each entry in the nested `data[]` (one per day):

| Field | Type | Description |
|-------|------|--------------|
| `num_trans` | number | Transactions touching this program on this day. |
| `num_trans_success` | number | Successful transactions on this day. |
| `interaction_volume` | number | Interaction volume (USD) on this day. |
| `active_users` | number | Distinct active users on this day. |
| `day` | string | Date in `YYYY-MM-DD` format (UTC). |
| `day_unix` | number | Same date as `day`, as a Unix timestamp (seconds, UTC midnight). |
| `insts` | object | Map of instruction name → call count for this day. Keys are dynamic per-program (whatever instructions the program's IDL exposes), not a fixed schema — iterate with `Object.entries()` rather than assuming specific keys. A synthetic `"Other Instructions"` key buckets calls Solscan couldn't attribute to a named instruction (e.g. unrecognized/long-tail instruction discriminators). |

**Example**

```json
{
  "success": true,
  "data": {
    "program_id": "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
    "days": 7,
    "data": [
      {
        "num_trans": 797352,
        "num_trans_success": 357250,
        "interaction_volume": 101490434.11147013,
        "active_users": 28407,
        "day": "2026-01-01",
        "day_unix": 1767225600,
        "insts": {
          "Other Instructions": 4749,
          "closePositionWithTokenExtensions": 1313,
          "collectFees": 3095,
          "collectFeesV2": 1979,
          "collectReward": 1514,
          "decreaseLiquidity": 1254,
          "increaseLiquidity": 2806,
          "openPositionWithTokenExtensions": 1530,
          "swap": 172284,
          "swapV2": 185285,
          "updateFeesAndRewards": 4025
        }
      }
    ],
    "num_trans": 10754614,
    "num_trans_success": 4688893,
    "interaction_volume": 1728840065.8594923,
    "last_24h_active_users": 42510,
    "active_users_change_24": "-19.00"
  },
  "metadata": {}
}
```

**Interpretation tips**

- Don't confuse the top-level `num_trans`/`num_trans_success`/`interaction_volume` (whole-range totals) with the same-named fields inside each `data[]` entry (single-day figures) — same keys, different scope, disambiguated only by nesting depth.
- `num_trans_success / num_trans` per day or in aggregate gives a success rate, if you need one (not returned as a precomputed field here — for a chain-wide success-rate ranking across programs, use `program list --sort-by success_rate` instead).
- `active_users` (per day, inside `data[]`) and `last_24h_active_users` (top-level, rolling 24h) measure different windows — don't sum/average `active_users` across days to approximate `last_24h_active_users`, since a user active on multiple days would double-count.
- `insts` keys are the program's actual instruction names as decoded from its IDL — useful for seeing which instructions dominate a program's traffic (e.g. `swap`/`swapV2` for a DEX) without a separate call to `transaction actions`.
- `--range` only accepts `7` or `30` — there's no arbitrary date-range option on this action; for a custom window use per-transaction data via `account transactions-enhanced --program <id> --from-time ... --to-time ...` instead.
