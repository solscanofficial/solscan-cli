# Token Response Fields — Price

Field-by-field description of the JSON the `token price-latest` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../token.md](../token.md) for flags/params). Shared envelope/error shape: [token.md](token.md#common-envelope).

This covers **current spot price** for one or more tokens — a lighter-weight snapshot than [`meta`/`meta-multi`](token-info.md#meta--meta-multi), which also returns price fields alongside full token identity/supply data.

## Contents

- [`price-latest`](#price-latest)

> Only actions with a confirmed field-level source are documented here. `price`, `price-multi`, and `price-history` (the deprecated/historical price actions) aren't covered yet — fall back to `--no-json` output or `--help` for those.

## `price-latest`

`solscan token price-latest --addresses <TOKEN_ADDRESS,...>` (max 50)

Takes only `--addresses` — unlike `price`/`price-multi`/`price-history`, there is **no `--from-time`/`--to-time`**; this action always returns the current snapshot, not a historical series. `data` is an **array**, one object per address, in the order requested. No pagination.

| Field | Type | Description |
|-------|------|--------------|
| `address` | string | The token's mint address (echoes the queried entry in `--addresses`). |
| `price` | number | Current price in USD. |
| `price_change_24h` | number | Percentage price change over the last 24h (e.g. `-6.501` means -6.501%, not a -6.501x multiple). Same semantics as `meta`'s `price_change_24h` — see [token-info.md](token-info.md#meta--meta-multi). |
| `market_cap` | number | Market capitalization in USD. |
| `updated_time` | number | Unix timestamp (seconds) of when this price was last refreshed — not when the request ran; use it to judge staleness for illiquid/long-tail tokens. |

**Example** (`solscan token price-latest --addresses pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn,27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4`, from Solscan's published reference example):

```json
{
  "success": true,
  "data": [
    {
      "address": "pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn",
      "price": 0.001999054696656554,
      "price_change_24h": -6.501,
      "market_cap": 1999033105.3049197,
      "updated_time": 1770697568
    },
    {
      "address": "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4",
      "price": 3.7170823538751523,
      "price_change_24h": -0.6362,
      "market_cap": 1231221697.3388374,
      "updated_time": 1770697568
    }
  ],
  "metadata": {}
}
```

**Interpretation tips**

- This is a **subset** of what `meta`/`meta-multi` return — no `name`/`symbol`/`decimals`/`supply`/`volume_24h`/`market_cap_rank`. Use `price-latest` when you only need price/market-cap for many tokens at once (up to 50 in one call, cheaper than `meta-multi`); use `meta`/`meta-multi` when you also need identity or supply data.
- A malformed/invalid address in `--addresses` fails the **whole request** with `400` (`errors.code`, e.g. `"Validation Error: Address [...] is invalid"`) — there's no partial-success mode where valid addresses still return and the bad one is flagged per-entry.
- `updated_time` is shared across all addresses in the same response in Solscan's example (`1770697568` for both) — that reflects a common refresh cycle, not evidence the two tokens were priced at the exact same instant; don't assume every address in a batch always carries an identical timestamp.
- All numeric fields (`price`, `price_change_24h`, `market_cap`) are full-precision JS floats — for very low-priced tokens (e.g. `0.001999...`), avoid re-rounding before doing further math (like recomputing market cap from price × supply).
