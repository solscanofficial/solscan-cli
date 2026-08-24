# Market Response Fields — List

Field-by-field description of the JSON the `market list` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../market.md](../market.md) for flags/params).

This covers the **bulk pool/market listing** — every AMM/DEX pool on Solana, paginated and sortable by activity — as opposed to a single pool's detail ([market-info.md](market-info.md)) or its time-series volume ([market-volume.md](market-volume.md)).

## `list`

`solscan market list [--page <n>] [--page-size <n>] [--program <address>] [--token-address <address>] [--sort-by <field>] [--sort-order <asc|desc>]`

`data` is an **array** — one object per pool. Default sort is `volumes_24h` descending; other sort fields are `created_time` and `trades_24h`. Filter to pools owned by a specific DEX program with `--program`, or pools involving a specific mint with `--token-address`.

Each item in `data`:

| Field | Type | Description |
|-------|------|--------------|
| `pool_address` | string | The pool/AMM account address. |
| `program_id` | string | Address of the DEX/AMM program that owns the pool (e.g. Whirlpool, Raydium). |
| `token1` | string | Mint address of one side of the pool. |
| `token1_account` | string | The pool's own vault token account holding its `token1` reserves. |
| `token2` | string | Mint address of the other side of the pool. |
| `token2_account` | string | The pool's own vault token account holding its `token2` reserves. |
| `total_volume_24h` | number | Trading volume in the last 24h. |
| `total_trade_24h` | number | Number of trades against this pool in the last 24h. |
| `created_time` | number | Unix epoch time the pool was created. |

**Example** (`solscan market list --sort-by volumes_24h --sort-order desc`)

```json
{
  "success": true,
  "data": [
    {
      "pool_address": "FpCMFDFGYotvufJ7HrFHsWEiiQCGbkLCtwHiDnh7o28Q",
      "program_id": "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
      "token1": "So11111111111111111111111111111111111111112",
      "token1_account": "6mQ8xEaHdTikyMvvMxUctYch6dUjnKgfoeib2msyMMi1",
      "token2": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "token2_account": "AQ36QRk3HAe6PHqBCtKTQnYKpt2kAagq9YoeTqUPMGHx",
      "total_volume_24h": 6715996,
      "total_trade_24h": 25377,
      "created_time": 1719792010
    }
  ]
}
```

**Interpretation tips**

- `token1`/`token2` are pool-internal ordering, not query-echo — when filtering with `--token-address`, don't assume the mint you passed lands in `token1`; check both fields.
- No TVL or price field here — this listing is activity-ranked only (volume/trade count). For a pool's token reserves and creation details, follow up with `market info --address <pool_address>`. For a longer volume history/TVL trend, use `market volume --address <pool_address>`.
- `--page-size` allowed values are `10/20/30/40/60/100` (wider than most other paginated actions, which commonly cap at `40` or `100`).
