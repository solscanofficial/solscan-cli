# Token Response Fields — Price

Field-by-field description of the JSON the `token price-latest`, `token price-history`, `token price`, and `token price-multi` commands return. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../token.md](../token.md) for flags/params). Shared envelope/error shape: [token.md](token.md#common-envelope).

This covers **spot and historical price** for one or more tokens — lighter-weight than [`meta`/`meta-multi`](token-info.md#meta--meta-multi), which also returns a price field alongside full token identity/supply data.

## Contents

- [`price-latest`](#price-latest)
- [`price-history`](#price-history)
- [`price` (deprecated)](#price-deprecated)
- [`price-multi` (deprecated)](#price-multi-deprecated)

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

## `price-history`

`solscan token price-history --addresses <TOKEN_ADDRESS,...> [--from-time <YYYYMMDD>] [--to-time <YYYYMMDD>]` (max 50 addresses)

`--from-time`/`--to-time` are **`YYYYMMDD`** integers (e.g. `20240701`), not unix timestamps — both are optional; omitting them returns whatever default history window the API picks. `data` is an **array**, one object per address, in the order requested — each holding its own nested `prices` time series. No pagination beyond the `from_time`/`to_time` window itself.

Each item in `data`:

| Field | Type | Description |
|-------|------|--------------|
| `token_address` | string | The token's mint address (echoes the queried entry in `--addresses`). **Named differently from `price-latest`'s `address` field** — don't assume the two actions share a key name. |
| `prices` | array of object | Daily price points for this token, ordered oldest→newest, one entry per calendar day in the requested (or default) range. |

Each entry in `prices`:

| Field | Type | Description |
|-------|------|--------------|
| `date` | number | Date as a `YYYYMMDD` integer (e.g. `20250326`), **not** a unix timestamp — same format as the `--from-time`/`--to-time` inputs, not `price-latest`'s `updated_time`. |
| `price` | number | Token price in USD on that date. |

**Example** (`solscan token price-history --addresses EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v,So11111111111111111111111111111111111111112 --from-time 20250326 --to-time 20250402`, trimmed to 2 of 3 tokens, from Solscan's published reference example):

```json
{
  "success": true,
  "data": [
    {
      "token_address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "prices": [
        { "date": 20250326, "price": 1.0000327 },
        { "date": 20250327, "price": 0.9999533 },
        { "date": 20250401, "price": 0.999944 },
        { "date": 20250402, "price": 1 }
      ]
    },
    {
      "token_address": "So11111111111111111111111111111111111111112",
      "prices": [
        { "date": 20250326, "price": 137.1231 },
        { "date": 20250327, "price": 138.29248 },
        { "date": 20250401, "price": 126.78 },
        { "date": 20250402, "price": 124.43755 }
      ]
    }
  ]
}
```

**Interpretation tips**

- Response key is `token_address`, while `price-latest` uses `address` for the same concept — a common source of bugs when code handles both actions generically; key off the action, not a shared field name.
- One `prices` entry per calendar day in range — with a wide `--from-time`/`--to-time` span and `--addresses` near the 50-token cap, the response can get large; narrow the date window if you only need a recent slice.
- Same **whole-request-fails** behavior as `price-latest`: one invalid address in `--addresses` returns `400` (`errors.code`) for the entire call rather than a partial result.
- `date`/`price` inside `prices` are unrelated to `price-latest`'s `updated_time`/`price_change_24h` — this action reports a flat historical series with no percentage-change field; compute deltas yourself from adjacent `prices` entries if needed.

## `price` (deprecated)

`solscan token price --address <TOKEN_ADDRESS> [--from-time <YYYYMMDD>] [--to-time <YYYYMMDD>]` — **deprecated**, use `price-history` instead (same underlying data, multi-address).

Single-address, single-token equivalent of `price-history` — `--from-time`/`--to-time` are the same optional `YYYYMMDD` integers, omit them for the API's default window. Because only one address is ever queried, `data` skips `price-history`'s per-address wrapper entirely: it's a **flat array** of daily price points directly, not an array containing one `token_address`/`prices` object.

| Field | Type | Description |
|-------|------|--------------|
| `date` | number | Date as a `YYYYMMDD` integer (e.g. `20240717`) — same format as `price-history`'s nested `prices[].date`. |
| `price` | number | Token price in USD on that date. |

**Example** (per [Solscan's published reference](https://pro-api.solscan.io/v2.0/token/price)):

```json
{
  "success": true,
  "data": [
    { "date": 20240717, "price": 0.895604 },
    { "date": 20240718, "price": 0.962621 },
    { "date": 20240719, "price": 0.953814 }
  ]
}
```

**Interpretation tips**

- Don't confuse this flat `data` array with `price-history`'s array-of-per-address-objects — code written generically against both actions needs to branch on which one was called, not just check `Array.isArray(data)` (both are arrays, but at different nesting depths).
- No `token_address`/`address` field appears anywhere in the response — since the request only ever covers one token, the caller already knows which address the series belongs to from the `--address` it passed.
- Same deprecation status as `price-multi`: Solscan recommends migrating to `price-history` (which covers both single- and multi-address cases via `--addresses`), so treat `price` as a thin compatibility shim rather than reaching for it in new code.

## `price-multi` (deprecated)

`solscan token price-multi --addresses <TOKEN_ADDRESS,...> [--from-time <YYYYMMDD>] [--to-time <YYYYMMDD>]` (max 50 addresses) — **deprecated**, use `price-history` instead.

The response is **byte-for-byte the same shape as [`price-history`](#price-history)**: `data` is an array, one object per address in the order requested, each with `token_address` and a nested `prices` array of `{date, price}` points. See the [`price-history` field table](#price-history) above for the full field-by-field breakdown — it applies here unchanged.

**Example** (per [Solscan's published reference](https://pro-api.solscan.io/v2.0/token/price/multi), trimmed to 2 of 3 tokens):

```json
{
  "success": true,
  "data": [
    {
      "token_address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "prices": [
        { "date": 20250326, "price": 1.0000327 },
        { "date": 20250327, "price": 0.9999533 },
        { "date": 20250401, "price": 0.999944 },
        { "date": 20250402, "price": 1 }
      ]
    },
    {
      "token_address": "So11111111111111111111111111111111111111112",
      "prices": [
        { "date": 20250326, "price": 137.1231 },
        { "date": 20250327, "price": 138.29248 },
        { "date": 20250401, "price": 126.78 },
        { "date": 20250402, "price": 124.43755 }
      ]
    }
  ]
}
```

**Interpretation tips**

- `price-multi` and `price-history` aren't just similarly-shaped — they're the deprecated and current names for the *identical* endpoint response. If you already handle `price-history`'s output, `price-multi`'s needs zero extra parsing logic.
- Same **whole-request-fails** behavior as the other price actions: one invalid address in `--addresses` returns `400` (`errors.code`) for the entire call rather than a partial result.
- Prefer `price-history` in new code — `price-multi` exists only for backward compatibility and Solscan may retire it entirely at some point (deprecated endpoints carry no removal-date guarantee).
