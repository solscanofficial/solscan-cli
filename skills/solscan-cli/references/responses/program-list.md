# Program Response Fields — `list`

Shared envelope: [program.md](program.md#common-envelope).

`solscan program list [--page <n>] [--page-size <10|20|30|40>] [--sort-by <field>] [--sort-order <asc|desc>]`

`data` is a **wrapper object**, not a bare array — `data.data` holds the ranked page of programs and `data.total` holds the full count across all pages. This is the same double-nesting pattern as `account leaderboard` (see [account-holdings.md](account-holdings.md#leaderboard)) — don't treat `data` itself as iterable.

| Field | Type | Description |
|-------|------|--------------|
| `data.data` | array of object | The ranked page of programs, ordered per `--sort-by`/`--sort-order`. |
| `data.total` | number | Total number of programs active in the last 90 days (not just this page) — use with `--page-size` to compute total pages. |

Each item in `data.data`:

| Field | Type | Description |
|-------|------|--------------|
| `program` | string | The program's on-chain address. |
| `number_transactions` | number | Total transactions touching this program in the last 90 days. This is what `--sort-by num_txs` ranks by — the CLI's sort-field name and the response's field name don't match (see below). |
| `number_transactions_success` | number | Successful transactions in the same window. Ranked by `--sort-by num_txs_success`. |
| `number_interaction_volume` | number | Total interaction volume (USD) in the same window. Ranked by `--sort-by interaction_volume`. Can be `0` for programs where Solscan doesn't track a USD-denominated volume (e.g. non-DeFi programs like a fee/compute-budget program) — `0` here means "not tracked," not necessarily "no activity." |
| `success_rate` | number | `number_transactions_success / number_transactions` as a percent (e.g. `79.37` = 79.37%), pre-computed server-side. Ranked by `--sort-by success_rate`. |
| `last_24h_active_users` | number | Distinct active users in the trailing 24 hours. Ranked by `--sort-by active_users_24h`. Can be `0` — seen on programs with high historical transaction counts but no recent direct user-initiated activity (e.g. an internal/CPI-only program). |

**`--sort-by` value → response field mapping** (the CLI flag values follow the [`analytics`](program-analytics.md) endpoint's naming, not this endpoint's actual field names):

| `--sort-by` value | Response field it ranks by |
|---|---|
| `num_txs` (default) | `number_transactions` |
| `num_txs_success` | `number_transactions_success` |
| `interaction_volume` | `number_interaction_volume` |
| `success_rate` | `success_rate` |
| `active_users_24h` | `last_24h_active_users` |

**Example** (`solscan program list --sort-by num_txs --sort-order desc --page-size 3`)

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "program": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ",
        "number_transactions": 1987015646,
        "number_transactions_success": 1577030480,
        "number_interaction_volume": 0,
        "success_rate": 79.37,
        "last_24h_active_users": 1053400
      },
      {
        "program": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA",
        "number_transactions": 1797414523,
        "number_transactions_success": 1359353089,
        "number_interaction_volume": 399679850000,
        "success_rate": 75.63,
        "last_24h_active_users": 1000031
      },
      {
        "program": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
        "number_transactions": 1488210612,
        "number_transactions_success": 254150878,
        "number_interaction_volume": 7664253000,
        "success_rate": 17.08,
        "last_24h_active_users": 185513
      }
    ],
    "total": 11986
  },
  "metadata": {}
}
```

**Interpretation tips**

- `data.total` (here `11986`) is the count of all programs active in the last 90 days, chain-wide — combine with `--page-size` to compute total pages (`Math.ceil(total / page_size)`), same idiom as `account leaderboard`.
- Ranking field ≠ activity quality: the top-ranked-by-`num_txs` program can have a low `success_rate` (see the third example row: 1.49B transactions but only 17.08% succeed) — a high transaction count alone doesn't mean the program is "healthy." Cross-check `success_rate` before treating raw transaction volume as a popularity signal.
- `number_interaction_volume` of `0` is common and expected for non-swap/non-DeFi programs (compute budget, fee routers, vote-adjacent programs) — don't read it as missing data or an error.
- This endpoint ranks **all** programs active in the window; for a curated shortlist of major DeFi platforms with human-readable names, use `program popular` instead (see [program-popular.md](program-popular.md)) — `list` gives you raw addresses only, no `platform_name`/`website`/`description`.
- No `--address` filter — this is always a chain-wide ranking. To get one specific program's numbers, either find it in a wide-enough page here or use `program analytics --address <id> --range <7|30>` for a purpose-built single-program lookup (which also breaks totals down by day) — see [program-analytics.md](program-analytics.md).
