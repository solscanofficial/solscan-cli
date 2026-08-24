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

## Option details

**`list`**: `--sort-by` `created_time`\|`volumes_24h`(default)\|`trades_24h` · `--page-size` `10/20/30/40/60/100`. `data` is a flat, unpaginated-metadata array of pools ranked by the sort field — full field-by-field breakdown: [responses/market-list.md](responses/market-list.md).

**`info`**: `--address` is the pool/market address (not a token mint), required. Response is a single pool's token reserves and creation metadata — full field-by-field breakdown: [responses/market-info.md](responses/market-info.md).

**`volume`**: `--time <start>,<end>` — single comma-separated pair in `YYYYMMDD` format (sent to the API as two `time[]` query values), optional; omit for the API's default window. Response is a single pool's 24h volume/trade snapshot plus a `days[]` daily time series — full field-by-field breakdown: [responses/market-volume.md](responses/market-volume.md).

**`positions`**: `--address` is the pool address; each row is one liquidity deposit a user made into that pool (a wallet can have several), not one row per wallet. `--sort-by` `position_value`(default)\|`created_time` · `--page-size` `10/20/30/40` · `--in-range <true|false>` filters to in-range or out-of-range positions (in range = current price is between the position's lower/upper price bounds); omit to return both. Response is an array of CLMM-style LP positions for the pool — full field-by-field breakdown: [responses/market-positions.md](responses/market-positions.md).

## Response Fields

Field-by-field description of each action's JSON response (types, meaning, edge cases): [responses/market.md](responses/market.md) (index + shared envelope) → [responses/market-list.md](responses/market-list.md) (`list`) / [responses/market-info.md](responses/market-info.md) (`info`) / [responses/market-volume.md](responses/market-volume.md) (`volume`) / [responses/market-positions.md](responses/market-positions.md) (`positions`). Read the relevant file before writing code that parses a response — a few fields differ from what Solscan's own published schema names (details noted in each file).

## Examples

```bash
solscan market list --sort-by volumes_24h --sort-order desc
solscan market list --token-address EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

solscan market info --address 8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh
solscan market volume --address 8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh --time 20240701,20240715

solscan market positions --address 939z7rR7etdm9W6rC2MHcrHXWEA3jJxMwDLzfD1qSvju --sort-by position_value --sort-order desc
solscan market positions --address 939z7rR7etdm9W6rC2MHcrHXWEA3jJxMwDLzfD1qSvju --in-range true --page-size 20
solscan market positions --address 939z7rR7etdm9W6rC2MHcrHXWEA3jJxMwDLzfD1qSvju --in-range false
```
