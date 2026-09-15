# Market Response Fields — Price OHLCV

Field-by-field description of the JSON the `market price-ohlcv` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../market.md](../market.md) for flags/params).

This covers **OHLCV candle data** (Open, High, Low, Close, Volume) for a single pool — a different shape from the pool's daily volume/TVL series ([market-volume.md](market-volume.md)) or its static reserve/creation info ([market-info.md](market-info.md)). It's the market-level counterpart to [`token price-ohlcv`](token-price-ohlcv.md), which scopes to a token (optionally narrowed to one pool via `--pool-id`) instead of taking a pool address directly — the two are separate endpoints with separate params; don't conflate them.

## `price-ohlcv`

`solscan market price-ohlcv --address <POOL_ADDRESS> [--from-time <unix seconds>] [--to-time <unix seconds>] [--res <resolution>] [--candles <n>] [--cursor <n>] [--direction base|quote]`

`data` is a nested object: `data.data` is the array of candles, alongside `data.candles`/`data.token`/`data.currency`/`data.direction`/`data.res`/`data.cursor` echoing back the effective query and pagination state.

| Field | Type | Description |
|-------|------|--------------|
| `data.data[].time` | number | Candle bucket start, as a `yyyyMMddHHmm` integer (e.g. `202609150405` = 2026-09-15 04:05). For resolutions of `1d` or coarser, the minute/hour portion is floored. |
| `data.data[].volume` | number | Trading volume during the candle's interval, in USD — **unaffected by `--direction`**. |
| `data.data[].high_price` | number | Highest price during the interval, denominated per `--direction` — see `data.token`/`data.currency` below for which token that is. |
| `data.data[].low_price` | number | Lowest price during the interval. |
| `data.data[].close_price` | number | Closing price at the end of the interval. |
| `data.data[].open_price` | number | Opening price at the start of the interval. |
| `data.candles` | number | Count of candles actually returned in `data.data` — an **actual count**, not an echo of the `--candles` request cap (a narrow `--from-time`/`--to-time` window returns however many candles fit, which can be far fewer). `--candles` itself is capped at `1000` (and must be `>= 1`). |
| `data.token` | string | The token being priced — the pool's token1 when `--direction quote` (default), or token2 when `--direction base`. |
| `data.currency` | string | The token the price is denominated in — the pool's token2 when `--direction quote` (default), or token1 when `--direction base`. `base` gives the reciprocal of `quote`'s prices for the same candle. |
| `data.direction` | string | Echoes the effective `--direction` (`base` or `quote`). |
| `data.res` | string | Resolution of the returned candles, echoing `--res`. |
| `data.cursor` | number | Pagination cursor — pass back as `--cursor` to fetch the next (older) page. See **Known discrepancies** for the correct param name and its backward-in-time behavior. |

Data is only available from **2026-01-01** onward — a pool with no trading history before that date simply has no candles before it, regardless of how far back `--from-time` reaches.

**Example** (`solscan market price-ohlcv --address 8FnX3xo2yYw3EUE6w3nQA4GfXGS9wpK6oj3veJpbFzLo --candles 3`, live call against the CLI on 2026-09-15, pool is a SOL/USDC AMM):

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "time": 202609150405,
        "volume": 50048.782066345215,
        "high_price": 101.68353,
        "low_price": 101.62361,
        "close_price": 101.67552,
        "open_price": 101.63512
      },
      {
        "time": 202609150406,
        "volume": 31335.88456594944,
        "high_price": 101.69205,
        "low_price": 101.65335,
        "close_price": 101.67678,
        "open_price": 101.67552
      },
      {
        "time": 202609150407,
        "volume": 37946.16004110128,
        "high_price": 101.679565,
        "low_price": 101.65722,
        "close_price": 101.668945,
        "open_price": 101.67678
      }
    ],
    "candles": 3,
    "token": "So11111111111111111111111111111111111111112",
    "currency": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "direction": "quote",
    "res": "1m",
    "cursor": 202609150405
  }
}
```

**Example** (same call with `--direction base` — prices become the reciprocal of the `quote` example above, e.g. `1 / 101.68353 ≈ 0.009834`, and `data.token`/`data.currency` swap):

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "time": 202609150422,
        "volume": 124416.65528175235,
        "high_price": 0.009848143,
        "low_price": 0.009843105,
        "close_price": 0.0098462,
        "open_price": 0.009844044
      }
    ],
    "candles": 1,
    "token": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "currency": "So11111111111111111111111111111111111111112",
    "direction": "base",
    "res": "1m",
    "cursor": 202609150422
  }
}
```

## Known discrepancies

Solscan's own published endpoint doc under-specifies or mis-describes a few behaviors. These were confirmed against the live API (2026-09-15) rather than assumed — verify again if Solscan changes the endpoint:

- **Cursor pagination walks backward in time and is inclusive of the boundary.** Passing a previous response's `data.cursor` back as `--cursor` returns a page ending at (and including) that same `time` value, extending further back into history — not forward to newer candles. This is the same convention as [`token price-ohlcv`](token-price-ohlcv.md#known-discrepancies); see that file for more detail on cursor semantics (it documents the same backward-pagination behavior and a related "duplicated most-recent candle" quirk observed on that endpoint).
- **`--address` silently accepts a token mint instead of a pool address — it just returns nothing.** Passing a token mint (rather than an actual pool/market address) doesn't error; it returns `"data": [], "candles": 0`. A genuinely malformed address (not a valid base58 pubkey) does 400 with `"Address [...] is invalid"`. If you get an unexpectedly empty result, double-check `--address` is a pool address (e.g. from `market list` or `market info`), not a token mint.

**Interpretation tips**

- For the pool's current token reserves (not historical price), use `market info --address <pool_address>` instead; for daily volume/TVL rather than sub-daily OHLCV, use `market volume --address <pool_address>`.
- `data.data` is sorted ascending by `time` (oldest first) within a page, but consecutive pages (via `--cursor`) move backward through history — concatenating pages in fetch order does **not** give a globally ascending series; sort by `time` again after merging pages if you need one continuous timeline.
- To find a pool address for a token pair, use `market list --token-address <MINT>` or `token markets --token <MINT>` first, then feed the resulting `pool_address` into `price-ohlcv`.
