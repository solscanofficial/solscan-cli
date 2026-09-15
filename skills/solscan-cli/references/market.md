# Market Reference

```bash
solscan market <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|----------|
| `list` | All trading pools/markets | — | `--page`, `--page-size`, `--program`, `--token-address`, `--sort-by`, `--sort-order` |
| `info` | Pool/market details by address | `--address` | — |
| `volume` | Historical volume data | `--address` | `--time` |
| `positions` | Users' liquidity positions in a pool (CLMM-style AMMs) | `--address` | `--page`, `--page-size`, `--sort-by`, `--sort-order`, `--in-range` |
| `price-ohlcv` | OHLCV candle data for a pool | `--address` | `--from-time`, `--to-time` (unix seconds), `--res`, `--candles`, `--cursor`, `--direction` |

## Option details

**`list`**: `--sort-by` `created_time`\|`volumes_24h`(default)\|`trades_24h` · `--page-size` `10/20/30/40/60/100`. `data` is a flat, unpaginated-metadata array of pools ranked by the sort field — full field-by-field breakdown: [responses/market-list.md](responses/market-list.md).

**`info`**: `--address` is the pool/market address (not a token mint), required. Response is a single pool's token reserves and creation metadata — full field-by-field breakdown: [responses/market-info.md](responses/market-info.md).

**`volume`**: `--time <start>,<end>` — single comma-separated pair in `YYYYMMDD` format (sent to the API as two `time[]` query values), optional; omit for the API's default window. Response is a single pool's 24h volume/trade snapshot plus a `days[]` daily time series — full field-by-field breakdown: [responses/market-volume.md](responses/market-volume.md).

**`positions`**: `--address` is the pool address; each row is one liquidity deposit a user made into that pool (a wallet can have several), not one row per wallet. `--sort-by` `position_value`(default)\|`created_time` · `--page-size` `10/20/30/40` · `--in-range <true|false>` filters to in-range or out-of-range positions (in range = current price is between the position's lower/upper price bounds); omit to return both. Response is an array of CLMM-style LP positions for the pool — full field-by-field breakdown: [responses/market-positions.md](responses/market-positions.md).

**`price-ohlcv`**: `--address` is a **pool address, not a token mint** (passing a mint doesn't error — it silently returns `data.data: []`/`candles: 0`). `--from-time`/`--to-time` are **unix seconds**. `--res` one of `1m`\|`5m`\|`15m`\|`30m`\|`1h`\|`4h`\|`8h`\|`1d`\|`1W`\|`1M`\|`1Y` (default `1m`). `--candles` `1`-`1000` (default `600`, and it's an actual-returned-count cap, not a guarantee — a narrow time window returns fewer). `--cursor` takes the previous response's `data.cursor` and walks **backward in time** (older candles), same convention as [`token price-ohlcv`](token.md#option-details). `--direction` `base`\|`quote`(default) picks which side of the pool the price is denominated in: `quote` prices the pool's token1 in terms of token2 (`data.token`=token1, `data.currency`=token2), `base` inverts it (`data.token`=token2, `data.currency`=token1, prices are the reciprocal); `volume` is unaffected by `--direction` either way. Data only available from 2026-01-01 onward. Full field-by-field breakdown: [responses/market-price-ohlcv.md](responses/market-price-ohlcv.md).

## Response Fields

Field-by-field description of each action's JSON response (types, meaning, edge cases): [responses/market.md](responses/market.md) (index + shared envelope) → [responses/market-list.md](responses/market-list.md) (`list`) / [responses/market-info.md](responses/market-info.md) (`info`) / [responses/market-volume.md](responses/market-volume.md) (`volume`) / [responses/market-positions.md](responses/market-positions.md) (`positions`) / [responses/market-price-ohlcv.md](responses/market-price-ohlcv.md) (`price-ohlcv`). Read the relevant file before writing code that parses a response — a few fields differ from what Solscan's own published schema names (details noted in each file).

## Examples

```bash
solscan market list --sort-by volumes_24h --sort-order desc
solscan market list --token-address EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

solscan market info --address 8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh
solscan market volume --address 8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh --time 20240701,20240715

solscan market positions --address 939z7rR7etdm9W6rC2MHcrHXWEA3jJxMwDLzfD1qSvju --sort-by position_value --sort-order desc
solscan market positions --address 939z7rR7etdm9W6rC2MHcrHXWEA3jJxMwDLzfD1qSvju --in-range true --page-size 20
solscan market positions --address 939z7rR7etdm9W6rC2MHcrHXWEA3jJxMwDLzfD1qSvju --in-range false

solscan market price-ohlcv --address 8FnX3xo2yYw3EUE6w3nQA4GfXGS9wpK6oj3veJpbFzLo --res 1h --candles 100
solscan market price-ohlcv --address 8FnX3xo2yYw3EUE6w3nQA4GfXGS9wpK6oj3veJpbFzLo --from-time 1757280000 --to-time 1757366400 --res 15m
```
