# Token Response Fields — Price OHLCV

Field-by-field description of the JSON the `token price-ohlcv` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../token.md](../token.md) for flags/params). Shared envelope/error shape: [token.md](token.md#common-envelope).

This covers **OHLCV candle data** (Open, High, Low, Close, Volume) for a single token, optionally scoped to one DEX pool via `--pool-id` — a different shape from [`price-latest`/`price-history`](token-price.md), which return spot/flat price series with no volume or high/low.

## `price-ohlcv`

`solscan token price-ohlcv --address <TOKEN_ADDRESS> [--from-time <unix seconds>] [--to-time <unix seconds>] [--res <resolution>] [--pool-id <address>] [--candles <n>] [--cursor <n>] [--currency usd|quote]`

Single-address only — there's no batch form like `price-history`'s `--addresses`. `--from-time`/`--to-time` are **unix seconds**, unlike `price-history`'s `YYYYMMDD` integers — don't reuse date values between the two actions. `data` is a nested object: `data.data` is the array of candles, alongside `data.candles`/`data.currency`/`data.res`/`data.cursor` echoing back the effective query params plus the pagination cursor.

| Field | Type | Description |
|-------|------|--------------|
| `data.data[].time` | number | Candle bucket start, as a `yyyyMMddHHmm` integer (e.g. `202609150229` = 2026-09-15 02:29) — not the same format as `price-history`'s `YYYYMMDD` `date` field. For resolutions of `1d` or coarser, the minute/hour portion is floored (e.g. `202609150000` for a daily candle). |
| `data.data[].volume` | number | Trading volume during the candle's interval, **always in USD** regardless of `--currency` — unlike the price fields below, `volume` does not get re-denominated by `--currency quote`. |
| `data.data[].high_price` | number | Highest price during the interval. |
| `data.data[].low_price` | number | Lowest price during the interval. |
| `data.data[].close_price` | number | Closing price at the end of the interval. |
| `data.data[].open_price` | number | Opening price at the start of the interval. |
| `data.candles` | number | Count of candles actually returned in `data.data` — this is an **actual count**, not an echo of the `--candles` request cap (e.g. requesting `--candles 1000` on a narrow `--from-time`/`--to-time` window returns however many candles fit that window, which can be far fewer than 1000). `--candles` itself is capped at `1000`. |
| `data.currency` | string | Currency denomination, echoing the effective `--currency` (`usd` or `quote`). See [Currency / quote denomination](#currency-quote-denomination) below for what `quote` actually does. |
| `data.res` | string | Resolution of the returned candles, echoing `--res`. |
| `data.cursor` | number | Pagination cursor for fetching the next (older) page — see **Known discrepancies** below for how this actually behaves. |

Data is only available from **2026-01-01** onward — a token or pool with no trading history before that date simply has no candles before it, regardless of how far back `--from-time` reaches.

**Example** (`solscan token price-ohlcv --address 9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump --candles 3`, live call against the CLI — note `--currency` wasn't passed, so `data.currency` is absent, unlike Solscan's own published example which always shows `"currency": "usd"`):

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "time": 202609150340,
        "volume": 7856.763352564143,
        "high_price": 0.13832250237464905,
        "low_price": 0.13743281364440918,
        "close_price": 0.1380572,
        "open_price": 0.13757227
      },
      {
        "time": 202609150341,
        "volume": 2677.9376211687922,
        "high_price": 0.13894842565059662,
        "low_price": 0.13829004764556885,
        "close_price": 0.13839653,
        "open_price": 0.1380572
      },
      {
        "time": 202609150342,
        "volume": 158.84177631139755,
        "high_price": 0.13889430463314056,
        "low_price": 0.13829892873764038,
        "close_price": 0.13840759,
        "open_price": 0.13839653
      }
    ],
    "candles": 3,
    "res": "1m",
    "cursor": 202609150340
  },
  "metadata": {}
}
```

## Currency / quote denomination

`--currency quote` **only has an effect when combined with `--pool-id`** — it re-denominates the four price fields (`high_price`/`low_price`/`open_price`/`close_price`) in terms of that pool's *other* token instead of USD. **`volume` is unaffected** — it's always reported in USD, no matter what `--currency` is set to. Without `--pool-id`, `--currency quote` is accepted (no error) but silently behaves identically to `usd` for the price fields too, since there's no specific pool — and therefore no specific quote token — to convert into.

## Known discrepancies

Solscan's published docs for this endpoint under-specify or mis-describe a few behaviors. These were confirmed against the live API (2026-09-15) rather than assumed — verify again if Solscan changes the endpoint:

- **`cursor` pagination walks backward in time, and isn't always the displayed `time` of the first row.** The endpoint doc's note "Need to pass cursor to get next page data" reads as if cursor moves forward, but in practice passing the previous response's `data.cursor` back as `--cursor` fetches the page of **older** candles (further back in history), not newer ones — cursor pagination walks from newest toward oldest. Also, `data.cursor` reflects the earliest **underlying data timestamp** in the page, which for coarser resolutions can differ from the first row's bucket-floored `time`: a `--res 1d` response showed a row displayed as `time: 202609120000` while `data.cursor` was `202609120941` (the actual first trade of that day, before being floored into the daily bucket). Don't assume `cursor === data.data[0].time`.
- **The most recent candle can appear duplicated with a different snapshot.** For resolutions coarser than `1m` (observed on both `1h` and `1d`), the last two rows in a response can share the exact same `time` bucket while carrying different `open_price`/`high_price`/`low_price`/`close_price`/`volume` — e.g. two consecutive `1h` rows both timestamped `202609150200` with different `close_price`. This happens because the most recent bucket is still in progress (a live/incomplete candle) and gets returned as two slightly different snapshots. If you dedupe by `time`, keep the **last** occurrence as the freshest snapshot, and treat the final row of any response as potentially still-forming rather than a closed candle.

**Interpretation tips**

- Unlike [`price-latest`](token-price.md#price-latest) (current snapshot only) and [`price-history`](token-price.md#price-history) (daily granularity only), `price-ohlcv` is the only token-price action with configurable sub-daily resolution (`1m` up to `1Y`) and volume/high/low — reach for it when the user needs candlestick/chart data, not just a price point or a daily series.
- `--pool-id` narrows the result to one specific DEX pool's trades instead of the token's aggregated cross-venue price — useful when comparing venues or when a token trades across multiple pools with meaningfully different liquidity/price action.
- `data.data` is sorted ascending by `time` (oldest first) within a page — the same convention as `price-history`'s `prices` array — but consecutive pages (via `--cursor`) move backward through history, so concatenating pages in the order they were fetched does **not** give a globally ascending series; sort by `time` again after merging pages if you need one continuous timeline.
