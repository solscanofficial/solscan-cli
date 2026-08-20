# Token Response Fields — Search

Field-by-field description of the JSON the `token search` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../token.md](../token.md) for flags/params). Shared envelope/error shape: [token.md](token.md#common-envelope).

This covers **keyword/address search results** — a paginated, ranked list of tokens matching a `--keyword` — as opposed to full single-token detail ([token-info.md](token-info.md)) or bulk market snapshots ([token-list.md](token-list.md)). The row shape is close to `meta`'s but not identical: `search` always carries `market_cap_rank` and adds `is_verified`, while dropping `mint_authority`/`freeze_authority`/`onchain_extensions`.

## Contents

- [`search`](#search)
- [Item fields](#item-fields)
- [Interpretation tips](#interpretation-tips)

> Example below is Solscan's published reference response, not independently captured live — treat field *presence* as authoritative, exact values as illustrative.

## `search`

`solscan token search --keyword <KEYWORD> [--search-mode exact|fuzzy] [--search-by combination|address|name|symbol] [--exclude-unverified] [--sort-by reputation|market_cap|volume_24h] [--sort-order asc|desc] [--page <n>] [--page-size 10|20|30|40]`

`data` is an **object**, not a flat array — same shape as `top`:

| Field | Type | Description |
|-------|------|--------------|
| `total` | number | Total number of matching tokens across all pages. **Capped at 10,000** even if more tokens technically match — don't expect `--page`/`--page-size` to ever reach past that many results, and don't treat a `total` of exactly `10000` as necessarily exact (it's Solscan's retrieval ceiling, not always a real count). |
| `items` | array of object | The matching token rows for this page — see [Item fields](#item-fields) below. |

## Item fields

| Field | Type | Description |
|-------|------|--------------|
| `address` | string | The token's mint address. |
| `name` | string | Token name. |
| `symbol` | string | Token ticker symbol. |
| `icon` | string | URL to the token's icon image. |
| `decimals` | number | Decimals used to convert any raw base-unit amount for this token into a human-readable one. |
| `supply` | string | Total supply in raw base units, **string-encoded** — parse with a bignum-safe method for large-supply tokens; divide by `10 ** decimals` for the human-readable total. |
| `holder` | number | Total number of holder accounts. |
| `creator` | string | Address that created the mint. |
| `create_tx` | string | Transaction signature that created the mint. |
| `created_time` | number | Unix timestamp (seconds) the mint was created. |
| `first_mint_tx` | string | Transaction signature of the token's first mint (first supply issuance) instruction — distinct from `create_tx` since the two can happen in separate transactions. |
| `first_mint_time` | number | Unix timestamp (seconds) of `first_mint_tx`. |
| `metadata` | object | The token's off-chain/on-chain metadata blob (typically `name`/`symbol`/`image`/`description` plus optional `website`/`twitter`, etc.). Unrelated to the envelope-level `metadata` field described in [token.md](token.md#common-envelope). |
| `metadata_uri` | string | URI the `metadata` object was fetched from. |
| `price` | number | Current price in USD. |
| `volume_24h` | number | Trading volume in USD over the last 24h, aggregated across all venues Solscan tracks — compare with `total_dex_vol_24h`. |
| `market_cap` | number | Market capitalization in USD. |
| `market_cap_rank` | number | Rank by market cap among tokens Solscan ranks. |
| `price_change_24h` | number | Percentage price change over the last 24h (e.g. `-3.15722` means -3.16%, not a fractional multiple). |
| `total_dex_vol_24h` | number | Trading volume in USD over the last 24h specifically on Solana DEXs. |
| `dex_vol_change_24h` | number | Percentage change in `total_dex_vol_24h` vs. the prior 24h window. |
| `is_verified` | boolean | Whether the token is verified. `true` when the token's Solscan reputation is **`OK`** or **`Neutral`** — reputations below that (e.g. flagged/spam) come back `false`. Corresponds to the `--exclude-unverified` filter — pass that flag to only get `true` rows back instead of filtering client-side. |

**Example** (per [Solscan's published reference](https://pro-api.solscan.io/v2.0/token/search)):

```json
{
  "success": true,
  "data": {
    "total": 10000,
    "items": [
      {
        "address": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        "name": "Jupiter",
        "symbol": "JUP",
        "icon": "https://static.jup.ag/jup/icon.png",
        "decimals": 6,
        "supply": "6863986103312354",
        "holder": 857050,
        "creator": "JUPhop9E8ZfdJ5FNHhxQt4uAih822Vs4QpqsWcewFbq",
        "create_tx": "4h5iBF43gC88BKrjkuC8RytGtKeMzj7Z93go9tPa3GCgnjgw1sQUsV4N44LCTxDuQ9KL8Sut88Jt1EunXNqptzbZ",
        "created_time": 1706172863,
        "first_mint_tx": "5JCoZV52kYhk7PLffGGhvXnxDjnqtQnQYwi6HP3ZyMehCPNXsf6CR4eZ87BhpLyQrtJdc35tALTKyWVW9PFjraHz",
        "first_mint_time": 1706257167,
        "metadata": {
          "name": "Jupiter",
          "image": "https://static.jup.ag/jup/icon.png",
          "symbol": "JUP",
          "description": "JUP is the official governance token for Jupiter.",
          "twitter": "https://twitter.com/JupiterExchange",
          "website": "https://jup.ag"
        },
        "metadata_uri": "https://static.jup.ag/jup/metadata.json",
        "price": 0.18968586648055302,
        "volume_24h": 4493305,
        "market_cap": 1310045716,
        "market_cap_rank": 130,
        "price_change_24h": -3.15722,
        "total_dex_vol_24h": 4104371.783203125,
        "dex_vol_change_24h": -15.0979,
        "is_verified": true
      }
    ]
  }
}
```

## Interpretation tips

- Unlike `list`/`top`, rows here aren't a thin snapshot — they carry the same market-data fields (`price`, `volume_24h`, `market_cap`, `market_cap_rank`, `price_change_24h`, `total_dex_vol_24h`, `dex_vol_change_24h`) plus full creation provenance (`creator`/`create_tx`/`created_time`/`first_mint_tx`/`first_mint_time`) and metadata in one call — often enough to skip a follow-up `token meta` lookup entirely.
- `--sort-by reputation` (the default) has no corresponding `reputation` field in the response — the closest visible proxy is `is_verified` (`true` for Solscan reputation `OK`/`Neutral`), but the underlying ranking signal itself (including lower tiers like flagged/spam) isn't exposed for you to read back.
- If you need supply-inflation or freeze risk (`mint_authority`/`freeze_authority`) or Token-2022 extension data, `search` doesn't carry them — follow up with `token meta --address <address>` ([token-info.md](token-info.md)).
- `total` being capped at 10,000 means very broad `--keyword` values (e.g. a single common letter with `--search-mode fuzzy`) will silently truncate — narrow the keyword or add `--search-by`/`--exclude-unverified` filters instead of trying to page past that ceiling.
