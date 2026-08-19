# Token Response Fields — Markets

Field-by-field description of the JSON the `token markets` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../token.md](../token.md) for flags/params). Shared envelope/error shape: [token.md](token.md#common-envelope).

This covers **DEX pool/market listings** for a token or token pair — liquidity and trading-activity stats per pool — as opposed to a wallet- or token-scoped activity log ([token-activity.md](token-activity.md)).

## Contents

- [`markets`](#markets)

> Only actions with a confirmed field-level source are documented here. If the action you need isn't listed yet, fall back to the `--no-json` output or `--help`, and treat unlabeled fields at face value rather than guessing their meaning.

## `markets`

`solscan token markets --token <TOKEN_OR_PAIR> [--sort-by <field>] [--program <addresses>] [--page <n>] [--page-size <n>]`

`--token` takes 1 or 2 comma-separated addresses: **1 token** returns every pool where that mint is either side; **2 tokens** scopes to pools that are exactly that pair (in either `token_1`/`token_2` order — don't assume the query order matches the response order). `data` is an **array** — one object per pool, ordered by `--sort-by` (`volume`\|`trade`\|`tvl`\|`trader`; no default — omit it and the API picks its own order). There is no `--sort-order` for this action (unlike `token defi`/`defi-export`) and no `total`/`has_next` metadata — page by incrementing `--page` until a response comes back with fewer than `--page-size` rows.

Each item in `data`:

| Field | Type | Description |
|-------|------|--------------|
| `pool_id` | string | The pool/AMM account address — the on-chain account representing this specific market. |
| `program_id` | string | Address of the DEX/AMM program that owns the pool (e.g. Raydium, Whirlpool, PumpSwap). |
| `token_1` | string | Mint address of one side of the pool. |
| `token_2` | string | Mint address of the other side of the pool. |
| `token_account_1` | string | The pool's own token account (vault) holding its `token_1` reserves — not a user wallet's token account. |
| `token_account_2` | string | The pool's own token account (vault) holding its `token_2` reserves. |
| `total_trades_24h` | number | Number of trades against this pool in the last 24h. |
| `total_trades_prev_24h` | number | Number of trades in the prior 24h window (i.e. 24–48h ago), for computing 24h-over-24h change. Can be **absent** on some pools — see interpretation tips. |
| `total_volume_24h` | number | Trading volume in the last 24h, in USD. |
| `total_volume_prev_24h` | number | Trading volume in the prior 24h window, in USD. Can be **absent**. |
| `total_tvl` | number | Total value locked in the pool, in USD. Not listed in Solscan's published API reference but consistently present on live responses — this is what `--sort-by tvl` sorts on. |
| `num_trader_24h` | number | Count of unique trader addresses in the last 24h. Also undocumented upstream but consistently present — what `--sort-by trader` sorts on. |
| `num_trader_prev_24h` | number | Unique trader count in the prior 24h window. Can be **absent**. |

**Example** (`solscan token markets --token So11111111111111111111111111111111111111112`, captured 2026-08-19)

```json
{
  "success": true,
  "data": [
    {
      "pool_id": "8FnX3xo2yYw3EUE6w3nQA4GfXGS9wpK6oj3veJpbFzLo",
      "program_id": "BiSoNHVpsVZW2F7rx2eQ59yQwKxzU5NvBcmKshCSUypi",
      "token_1": "So11111111111111111111111111111111111111112",
      "token_2": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "token_account_1": "ATRsNGv2nDw7hSMfkUTBoVUDsFDwN7po7KbecyiGWNB4",
      "token_account_2": "2Y7HATmn9aJBcxCskE5V2U2epmjvkZmB51zTJBbhj4cU",
      "total_trades_24h": 549282,
      "total_trades_prev_24h": 486036,
      "total_volume_24h": 306503854.7174035,
      "total_volume_prev_24h": 209746143.70561397,
      "total_tvl": 3780681.483122371,
      "num_trader_24h": 63580,
      "num_trader_prev_24h": 59640
    },
    {
      "pool_id": "9AcnPiEASFjTVqGH5akz1PbJmoUeWx6NV3mMDUKZspy6",
      "program_id": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA",
      "token_1": "So11111111111111111111111111111111111111112",
      "token_2": "4g5bBMvugH4bAXX5qwLRvgjhV4FpoQm2VigBQss2wgkE",
      "token_account_1": "DT2yPH62J8JCerqGfAYo3xdQP1Ke7jH7x1V3wXHuNFwu",
      "token_account_2": "9GAgEDCXyjqwYSSkDtcKZtPBXV8uwjjVV3QriLD1LCbz",
      "total_trades_24h": 128039,
      "total_volume_24h": 151989405.04587886,
      "total_tvl": 0.000001079204859185731,
      "num_trader_24h": 5247
    }
  ]
}
```

**Interpretation tips**

- The `_prev_24h` fields (`total_trades_prev_24h`, `total_volume_prev_24h`, `num_trader_prev_24h`) are missing on some rows (seen on lower-activity pools in the second example above) rather than present-as-`0` — treat a missing field as "no comparable prior-window data," not as zero activity, and guard for its absence before computing a percent change.
- `token_1`/`token_2` are pool-internal ordering, not query-echo — when you pass 2 addresses to `--token`, don't assume `token_1` matches the first address you passed; check both fields.
- `token_account_1`/`token_account_2` are the pool's vaults, not any user's wallet token account — don't confuse these with the `token_account` fields returned by `account tokens`.
- No `value`/USD price-per-token field here — this endpoint reports pool-level aggregates (volume, trades, TVL, traders), not a spot price. For a token's USD price, use `token price-latest`/`price-history` instead.
- This action has no CSV/export twin — for bulk pool data beyond one page, increment `--page` (no page cap is documented, unlike the 5000-row cap on `*-export` actions).
