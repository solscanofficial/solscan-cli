# Token Reference

```bash
solscan token <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|----------|
| `meta` | Full token profile: identity, supply, authorities, creation provenance, live market snapshot (price/mcap/24h volume) | `--address` | — |
| `meta-multi` | Same object as `meta`, batched — `data` is an array (max 50 addresses) | `--addresses` | — |
| `price-latest` | Latest price of multiple tokens (max 50) | `--addresses` | — |
| `price-history` | Historical price of multiple tokens (max 50) | `--addresses` | `--from-time`, `--to-time` (YYYYMMDD) |
| `price` ⚠️ deprecated | Single token price history — use `price-history` | `--address` | `--from-time`, `--to-time` |
| `price-multi` ⚠️ deprecated | Batch price history — use `price-history` | `--addresses` | `--from-time`, `--to-time` |
| `price-ohlcv` | OHLCV candle data (single token, single pool optional) | `--address` | `--from-time`, `--to-time` (unix seconds), `--res`, `--pool-id`, `--candles`, `--cursor`, `--currency` |
| `holders` | Top holder list with amounts | `--address` | `--page`, `--page-size`, `--from-amount`, `--to-amount`, `--from-value`, `--to-value` |
| `markets` | DEX markets: 1 token = all markets, 2 tokens = pair search | `--token` | `--sort-by`, `--program`, `--page`, `--page-size` |
| `transfers` | Transfer history for a token | `--address` | `--activity-type`, `--from`, `--exclude-from`, `--to`, `--exclude-to`, `--amount`, `--value`, `--from-time`, `--to-time`, `--exclude-amount-zero`, `--sort-by`, `--sort-order`, `--page`, `--page-size` |
| `defi` | DeFi activity involving a token | `--address` | `--activity-type`, `--from`, `--source`, `--token`, `--value`, `--from-time`, `--to-time`, `--sort-by`, `--sort-order`, `--page`, `--page-size` |
| `defi-export` | DeFi activity CSV (max 5000 rows, 10 req/min) | `--address` | `--activity-type`, `--from`, `--platform`, `--source`, `--token`, `--from-time`, `--to-time`, `--sort-by`, `--sort-order`, `--output` |
| `historical` | Daily historical supply/holder-count/transfer-count/trade-volume time series | `--address` | `--range` (`7`\|`30`, default `7`) |
| `search` | Search by keyword/address/name/symbol | `--keyword` | `--search-mode`, `--search-by`, `--exclude-unverified`, `--sort-by`, `--sort-order`, `--page`, `--page-size` |
| `trending` | Currently trending tokens | — | `--limit` |
| `list` | Full token list | — | `--page`, `--page-size`, `--sort-by`, `--sort-order` |
| `list-v2` | Token screener: ~190 activity/price/holder metrics per token, sort + range-filter on any of them | — | `--sort-by`, `--sort-order`, `--page`, `--page-size`, `--platform`, `--filter` (repeatable) |
| `top` | Top tokens by market cap | — | — |
| `latest` | Newly listed tokens by launch platform | — | `--platform-id`, `--page`, `--page-size` |

## Option details

**`meta` / `meta-multi`**: address input only — no pagination/sort/time flags. `meta` → `--address` (one mint); `meta-multi` → `--addresses` (comma-separated, **hard cap 50**, `400` if exceeded). `meta` returns `data` as an object; `meta-multi` returns `data` as an array with one entry **per resolvable address** — valid-but-unknown mints are dropped silently, so match by the `address` field, not list position. `meta-multi` CU cost scales per address. Response fields (identity, supply/authorities, creation provenance, `metadata` sub-object, `onchain_extensions`, deprecated `volume_24h` vs `total_dex_vol_24h`, error codes) → [responses/token-info.md](responses/token-info.md).

**`holders`**: `--page-size` `10/20/30/40` · `--from-amount`/`--to-amount` are raw token amount strings · `--from-value`/`--to-value` are USD.

**`markets`**: `--token` required — pass 1 address for all markets of that token, or 2 comma-separated for a specific pair · `--sort-by` `volume`\|`trade`\|`tvl`\|`trader` · `--program` comma-separated max 5 (DEX program filter) · `--page-size` `10/20/30/40/60/100`.

**`price-history`**: `--from-time`/`--to-time` are **`YYYYMMDD`**, not unix timestamps.

**`price-ohlcv`**: single `--address` only (no batch form) · `--from-time`/`--to-time` are **unix seconds**, unlike `price-history`'s `YYYYMMDD` · `--res` one of `1m`\|`5m`\|`15m`\|`30m`\|`1h`\|`4h`\|`8h`\|`1d`\|`1W`\|`1M`\|`1Y` (default `1m`) · `--candles` `1`-`1000` (default `600`) · `--pool-id` scopes to one DEX pool instead of the token's aggregated price · `--cursor` walks **backward in time** (paginates to older candles, not newer) · `--currency` `usd`(default)\|`quote` — `quote` only takes effect **when combined with `--pool-id`**, and only re-denominates the four price fields (`open`/`high`/`low`/`close_price`) into that pool's quote token; **`volume` is always USD regardless of `--currency`**. `--currency quote` without `--pool-id` is accepted but silently behaves like `usd` since there's no quote token to convert to, see [responses/token-price-ohlcv.md](responses/token-price-ohlcv.md#currency-quote-denomination). Data only available from 2026-01-01 onward.

**`transfers`**: comma-separated `--from`/`--exclude-from`/`--to`/`--exclude-to` max 5 · `--amount`/`--value` are single flags in `min,max` comma-separated form · `--sort-by` `block_time` · `--page-size` `10/20/30/40/60/100`.

**`defi` / `defi-export`**: `--source` comma-separated max 5 · `--value <min>,<max>` comma-separated USD range · `defi-export` adds `--platform` (comma-separated max 5), drops pagination.

Transfer/DeFi `--activity-type` enums are the same lists as in [account.md](account.md) (`ACTIVITY_SPL_*` for transfers, `ACTIVITY_TOKEN_*`/`ACTIVITY_*` for DeFi).

**`historical`**: `--range` `7`\|`30` days only — no other flags. Returns a daily time series, not a live snapshot — no `price` field here (unlike `meta`/`price-latest`); see [responses/token-historical.md](responses/token-historical.md).

**`search`**: `--search-mode` `exact`(default)\|`fuzzy` · `--search-by` `combination`(default)\|`address`\|`name`\|`symbol` · `--exclude-unverified` boolean flag · `--sort-by` `reputation`(default)\|`market_cap`\|`volume_24h` · `--sort-order` `asc`\|`desc`(default) · `--page-size` `10/20/30/40`(default `10`). `total` in the response is capped at 10,000 matches regardless of how many actually match — see [responses/token-search.md](responses/token-search.md).

**`list`**: `--sort-by` `holder`\|`market_cap`(default)\|`created_time` · `--page-size` `10/20/30/40/60/100`.

**`list-v2`** (token screener):
- `--sort-by` any metric below (default `volume_1m`, the API's default; pass an explicit metric such as `volume_24h` for a more stable ranking) · `--sort-order` `asc`\|`desc`(default).
- `--filter <metric>=<min>,<max>` is **repeatable**, one metric per flag. Leave one side empty for an open bound: `--filter volume_24h=100000,` (≥ 100k), `--filter holder_top_1_balance_pct=,20` (≤ 20%), or set both: `--filter market_cap=1000000,5000000`. Bounds are inclusive. Every metric is filterable, and filters on different metrics are AND-ed. The CLI maps each one to the API's `from_<metric>`/`to_<metric>` params and rejects unknown metric names before calling the API.
- `--platform` comma-separated, any of the `latest --platform-id` values below. Multiple values are OR-ed.
- `--page-size` `10/20/30/40/60/100` (default `10`, anything else → `400`) · `--page` `1`–`1000`. `data.total` is capped at `10000` and only that window is reachable: once `page × page-size` passes 10000 (e.g. `--page-size 100 --page 101`) the response is `list_tokens: []` with `total: 0`. Stop paging on an empty `list_tokens`; to reach tokens beyond the window, tighten `--filter` instead of paging deeper.
- **Metrics**: `<activity>_<window>` and `<activity>_<window>_change_pct`, where activity ∈ `volume`, `buy_volume`, `sell_volume` (USD), `num_trade`, `num_buy_trade`, `num_sell_trade`, `num_trader`, `num_buyer`, `num_seller` and window ∈ `1m`, `5m`, `30m`, `1h`, `4h`, `8h`, `24h`, `7d`, `30d` · `price_<window>_change_pct` · `trader_hhi_24h`, `trader_top_{1,5,20,100}_volume_pct_24h` · `market_cap`, `total_supply`, `liquidity`, `num_pool`, `num_holder`, `fdv`, `circulating_supply`, `first_listing_time` (unix seconds) · `holder_gini`, `holder_hhi`, `holder_top_{1,5,20,100}_balance_pct`. Percentages are 0–100; gini/HHI are 0–1.
- Rows have **no name, symbol, decimals or price**, only `token_address` plus metrics. Resolve identity with `meta-multi` before showing tokens to the user. Response fields and quirks → [responses/token-list-v2.md](responses/token-list-v2.md).
- `--no-json` prints all 193 fields per row, which gets very long. For user-facing output, take the JSON and show only the relevant columns.

**`trending`**: `--limit` (default `10`, max `100`) - no sort/filter flags. Response rows are identity-only (`address`/`decimals`/`name`/`symbol`) — thinner than `list`/`top`, which also carry `market_cap`/`price`/`holder`; see [responses/token-list.md](responses/token-list.md#trending).

**`top`**: takes **no options at all** — no pagination, sorting, or limit flag; the API returns a fixed top-N list.

**`latest`**: `--platform-id` one of `jupiter`, `lifinity`, `meteora`, `orca`, `raydium`, `phoenix`, `sanctum`, `kamino`, `pumpfun`, `openbook`, `apepro`, `stabble`, `jupiterdca`, `jupiter_limit_order`, `solfi`, `zerofi`, `letsbonkfun_launchpad`, `raydium_launchlab`, `believe_launchpad`, `moonshot_launchpad`, `jup_studio_launchpad`, `bags_launchpad`, `stonkfun_launchpad`. `--page-size` `10/20/30/40/60/100`. Response rows are the `list`/`top` shape plus `platform`/`creator`, but `price_24h_change`/`holder` aren't guaranteed present (a freshly-created token may not have them tracked yet) — see [responses/token-list.md](responses/token-list.md#latest).

## Response Fields

Field-by-field description of each action's JSON response (types, meaning, edge cases): [responses/token.md](responses/token.md) (envelope) → [responses/token-info.md](responses/token-info.md) (`meta`, `meta-multi`) / [responses/token-price.md](responses/token-price.md) (`price-latest`, `price-history`, `price`, `price-multi`) / [responses/token-price-ohlcv.md](responses/token-price-ohlcv.md) (`price-ohlcv`) / [responses/token-activity.md](responses/token-activity.md) (`transfers`, `defi`, `defi-export`) / [responses/token-market.md](responses/token-market.md) (`markets`) / [responses/token-holders.md](responses/token-holders.md) (`holders`) / [responses/token-list.md](responses/token-list.md) (`list`, `top`, `trending`, `latest`) / [responses/token-list-v2.md](responses/token-list-v2.md) (`list-v2`) / [responses/token-historical.md](responses/token-historical.md) (`historical`) / [responses/token-search.md](responses/token-search.md) (`search`).

## Examples

```bash
solscan token trending
solscan token meta --address So11111111111111111111111111111111111111112

# Latest price, multiple tokens
solscan token price-latest --addresses So11111111111111111111111111111111111111112,EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Historical price (YYYYMMDD dates)
solscan token price-history --addresses So11111111111111111111111111111111111111112 --from-time 20240701 --to-time 20240715

# OHLCV candles (unix-second range, hourly resolution)
solscan token price-ohlcv --address 9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump --res 1h --candles 100

# OHLCV for one specific DEX pool
solscan token price-ohlcv --address 9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump --pool-id 6e7V9eegCHw997T72MxgwwJipZ6GJyZF8NvjkzT1rvpN --res 5m

# All markets for a token, vs a specific pair
solscan token markets --token So11111111111111111111111111111111111111112
solscan token markets --token So11111111111111111111111111111111111111112,EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

solscan token list --sort-by holder --sort-order desc --page-size 20
solscan token latest --platform-id pumpfun --page-size 20

# Screener: biggest 1h gainers among pump.fun/meteora tokens with >= $100k 24h volume
solscan token list-v2 --sort-by price_1h_change_pct --filter volume_24h=100000, --platform pumpfun,meteora

# Newest tokens where the top holder owns <= 20% and >= 200 traders in 24h (page 2 of 20-row pages)
solscan token list-v2 --sort-by first_listing_time --filter holder_top_1_balance_pct=,20 --filter num_trader_24h=200, --page-size 20 --page 2

# Small caps ($1M-$5M market cap) with >= $50k liquidity, by 24h volume
solscan token list-v2 --sort-by volume_24h --filter market_cap=1000000,5000000 --filter liquidity=50000, --page-size 40
solscan token historical --address So11111111111111111111111111111111111111112 --range 30

# Fuzzy name search
solscan token search --keyword "bonk" --search-mode fuzzy --sort-by market_cap
solscan token search --keyword "USDC" --search-by symbol --exclude-unverified

# Holders filtered by USD value range
solscan token holders --address EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --from-value 10000 --to-value 100000

solscan token defi-export --address So11111111111111111111111111111111111111112 --output sol-defi.csv
```
