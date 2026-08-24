# Market Response Fields — Positions

Field-by-field description of the JSON the `market positions` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../market.md](../market.md) for flags/params).

A "position" here is the record created when a user deposits liquidity into a pool run by a concentrated-liquidity (CLMM) program (e.g. Orca Whirlpool, Raydium CLMM, etc...). This action lists those positions for a given pool: who opened each one (`position_owner`), the price range they chose, and its current value — distinct from the pool-level aggregates in [market-info.md](market-info.md) and [market-volume.md](market-volume.md).

## `positions`

`solscan market positions --address <POOL_ADDRESS> [--page <n>] [--page-size <n>] [--sort-by <field>] [--sort-order <asc|desc>] [--in-range <true|false>]`

`data` is an **array** — one object per position. Default sort is `position_value`; the other sort field is `created_time`. `--in-range true` returns only positions whose current price sits inside their range; `--in-range false` returns only out-of-range positions; omit it for both.

Each item in `data`:

| Field | Type | Description |
|-------|------|--------------|
| `position_id` | string | The position account address (unique per LP position, not per pool). |
| `created_time` | number | Unix epoch time the position was opened. |
| `pool_id` | string | The pool/market this position belongs to (echoes `--address`). |
| `token_address` | string | Address associated with the position (e.g. the position NFT mint, program-dependent). |
| `position_owner` | string | Wallet address that owns the position. |
| `position_value` | number | Current value of the position; duplicated in `price_info.value`. |
| `position_type` | string | Pool/position mechanism, e.g. `clmm`. |
| `is_pos_in_range` | boolean | Whether the position is currently in range. |
| `token_info` | object | The position's underlying token amounts — **not an array**, despite Solscan's schema labeling it one. |
| `token_info.token_1` / `token_info.token_2` | string | Mint addresses of the position's two sides. |
| `token_info.amount_1` / `token_info.amount_2` | number | Current amount held in each side. |
| `program` | string | Address of the DEX/AMM program that owns the pool. |
| `price_info` | object | Price-range details — **not an array**, despite Solscan's schema labeling it one. |
| `price_info.current_price` | number | Current pool price. |
| `price_info.lower_price` / `price_info.upper_price` | number | The position's price range bounds. |
| `price_info.value` | number | Same value as top-level `position_value`. |
| `price_info.is_in_range` | boolean | Same meaning as top-level `is_pos_in_range`. |
| `price_info.updated_time` | number | Unix epoch time this price snapshot was last updated. |

**Example** (`solscan market positions --address 939z7rR7etdm9W6rC2MHcrHXWEA3jJxMwDLzfD1qSvju --in-range false`)

```json
{
  "success": true,
  "data": [
    {
      "position_id": "DVbzihLqQh5uDtgG1FD6VMaGkUUotaNeZGSbUMVcj5qM",
      "created_time": 1734620765,
      "pool_id": "Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE",
      "token_address": "9oEvUsQovGnNRT2Sa2qURtfttVHM2TW26NS7DPR7tYb1",
      "position_owner": "FK8X52AaquiZD4XevuSzNsKdF73y3SQjnfMmuFcJXerT",
      "position_value": 8.018845e-8,
      "token_info": {
        "amount_1": 1,
        "amount_2": 0,
        "token_1": "So11111111111111111111111111111111111111112",
        "token_2": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
      },
      "program": "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
      "price_info": {
        "current_price": 80.3047756807606,
        "lower_price": 200.14372102907993,
        "updated_time": 1775552367,
        "upper_price": 224.75926902839817,
        "value": 8.018845e-8,
        "is_in_range": false
      },
      "position_type": "clmm",
      "is_pos_in_range": false
    }
  ]
}
```

**Interpretation tips**

- "In range" means `price_info.current_price` falls between `price_info.lower_price` and `price_info.upper_price`; `is_pos_in_range`/`price_info.is_in_range` are pre-computed for you — no need to recompute from the three price fields, but they're there if you want to double check.
- `position_value` and `price_info.value` are the same number reported twice — read either one, no need to reconcile a mismatch.
- Very small `position_value` (like `8.018845e-8` above) usually means a dust/near-empty position, not a data error.
- A wallet can hold multiple positions in the same pool (e.g. several separate liquidity deposits with different price ranges) — `position_owner` is not unique per pool, don't assume one row per LP.
- This is a per-pool listing (scoped by `--address` = pool address). To find all positions a given wallet holds *across* pools, use `account portfolio --address <WALLET>` instead — its `positions[]` array is the wallet-scoped view of the same underlying LP positions (see [account-holdings.md](account-holdings.md#portfolio)); no need to enumerate pools and filter `position_owner` yourself.
