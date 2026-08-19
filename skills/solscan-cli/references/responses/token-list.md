# Token Response Fields — List / Top

Field-by-field description of the JSON the `token list` and `token top` commands return. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../token.md](../token.md) for flags/params). Shared envelope/error shape: [token.md](token.md#common-envelope).

This covers **bulk token snapshots** — paginated/ranked listings of many tokens at once, each row a lightweight market summary — as opposed to full single-token detail ([token-info.md](token-info.md), which has far more fields per token).

## Contents

- [`list`](#list)
- [`top`](#top)
- [Shared item fields](#shared-item-fields)

> Only actions with a confirmed field-level source are documented here. If the action you need isn't listed yet, fall back to the `--no-json` output or `--help`, and treat unlabeled fields at face value rather than guessing their meaning.

## `list`

`solscan token list [--sort-by <field>] [--sort-order <order>] [--page <n>] [--page-size <n>]`

Supports up to 50,000 items across a full paginated crawl. `data` is a **flat array** of token summary objects (see [Shared item fields](#shared-item-fields) below) — unlike `top`, there's no wrapping `total`/`items` object, and no metadata about how many pages exist. Page by incrementing `--page` until a response comes back with fewer rows than `--page-size`.

`--sort-by` accepts `holder` \| `market_cap` \| `created_time`; `--sort-order` accepts `asc` \| `desc`. Both are optional — omit them and the API applies its own default order.

**Example** (per [Solscan's published reference](https://pro-api.solscan.io/v2.0/token/list); not independently captured live):

```json
{
  "success": true,
  "data": [
    {
      "address": "So11111111111111111111111111111111111111112",
      "decimals": 9,
      "name": "Wrapped SOL",
      "symbol": "SOL",
      "market_cap": 120740500232,
      "price": 254.31,
      "price_24h_change": -0.49324,
      "holder": 1263348,
      "created_time": 1713016188
    }
  ]
}
```

## `top`

`solscan token top` — no query parameters at all; the underlying API takes none, so there's nothing to page or sort with a flag.

`data` is an **object**, not an array directly:

| Field | Type | Description |
|-------|------|--------------|
| `total` | number | Count of tokens returned in `items` (Solscan's published example shows a fixed small top-N list, not a paginated total). |
| `items` | array of object | The ranked token summaries — see [Shared item fields](#shared-item-fields). |

**Example** (per [Solscan's published reference](https://pro-api.solscan.io/v2.0/token/top); not independently captured live):

```json
{
  "success": true,
  "data": {
    "total": 2000,
    "items": [
      {
        "address": "So11111111111111111111111111111111111111112",
        "decimals": 9,
        "name": "Wrapped SOL",
        "symbol": "SOL",
        "market_cap": 120740500232,
        "price": 254.31,
        "price_24h_change": -0.49324,
        "holder": 1263348,
        "created_time": 1713016188
      },
      ...
    ]
  }
}
```

## Shared item fields

Both actions return the same per-token shape — `list` at the top level of `data`, `top` inside `data.items`:

| Field | Type | Description |
|-------|------|--------------|
| `address` | string | The token's mint address. |
| `decimals` | number | Decimals used to convert any raw base-unit amount for this token into a human-readable one. |
| `name` | string | Token name. |
| `symbol` | string | Token ticker symbol. |
| `market_cap` | number | Market capitalization in USD. |
| `price` | number | Current price in USD. |
| `price_24h_change` | number | Percentage price change over the last 24h (e.g. `-0.49324` means -0.49%, not a fractional multiple). |
| `holder` | number | Total number of holder accounts. |
| `created_time` | number | Unix timestamp (seconds) the token was created. |
| `creator` | string | The mint's creator address. Documented **only** on `list`'s schema (not on `top`'s) — treat it as optional either way and don't assume its absence means the request failed. |

**Interpretation tips**

- These rows are intentionally thin — a fast bulk snapshot for ranking/sorting many tokens, not full token detail. For everything else about a specific token (supply, authorities, off-chain metadata, `market_cap_rank`, volume, etc.) follow up with `token meta --address <address>` — see [token-info.md](token-info.md).
- `list` and `top` pull from the same underlying market-data snapshot as `token trending` and the market-data fields on `token meta` (`price`, `market_cap`, `price_24h_change`/`price_change_24h`) — don't be surprised if numbers line up closely across commands, modulo cache staleness between calls.
