# Token Reference

```bash
solscan token <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|----------|
| `meta` | Name, symbol, decimals, supply | `--address` | — |
| `meta-multi` | Batch metadata (max 50) | `--addresses` | — |
| `price-latest` | Latest price of multiple tokens (max 50) | `--addresses` | — |
| `price-history` | Historical price of multiple tokens (max 50) | `--addresses` | `--from-time`, `--to-time` (YYYYMMDD) |
| `price` ⚠️ deprecated | Single token price history — use `price-history` | `--address` | `--from-time`, `--to-time` |
| `price-multi` ⚠️ deprecated | Batch price history — use `price-history` | `--addresses` | `--from-time`, `--to-time` |
| `holders` | Top holder list with amounts | `--address` | `--page`, `--page-size`, `--from-amount`, `--to-amount`, `--from-value`, `--to-value` |
| `markets` | DEX markets: 1 token = all markets, 2 tokens = pair search | `--token` | `--sort-by`, `--program`, `--page`, `--page-size` |
| `transfers` | Transfer history for a token | `--address` | `--activity-type`, `--from`, `--exclude-from`, `--to`, `--exclude-to`, `--amount`, `--value`, `--from-time`, `--to-time`, `--exclude-amount-zero`, `--sort-by`, `--sort-order`, `--page`, `--page-size` |
| `defi` | DeFi activity involving a token | `--address` | `--activity-type`, `--from`, `--source`, `--token`, `--value`, `--from-time`, `--to-time`, `--sort-by`, `--sort-order`, `--page`, `--page-size` |
| `defi-export` | DeFi activity CSV (max 5000 rows, 10 req/min) | `--address` | `--activity-type`, `--from`, `--platform`, `--source`, `--token`, `--from-time`, `--to-time`, `--sort-by`, `--sort-order`, `--output` |
| `historical` | Historical price/supply/volume/holder/trader data | `--address` | `--range` (`7`\|`30`, default `7`) |
| `search` | Search by keyword/address/name/symbol | `--keyword` | `--search-mode`, `--search-by`, `--exclude-unverified`, `--sort-by`, `--sort-order`, `--page`, `--page-size` |
| `trending` | Currently trending tokens | — | `--limit` |
| `list` | Full token list | — | `--page`, `--page-size`, `--sort-by`, `--sort-order` |
| `top` | Top tokens by market cap | — | — |
| `latest` | Newly listed tokens by launch platform | — | `--platform-id`, `--page`, `--page-size` |

## Option details

**`holders`**: `--page-size` `10/20/30/40` · `--from-amount`/`--to-amount` are raw token amount strings · `--from-value`/`--to-value` are USD.

**`markets`**: `--token` required — pass 1 address for all markets of that token, or 2 comma-separated for a specific pair · `--sort-by` `volume`\|`trade`\|`tvl`\|`trader` · `--program` comma-separated max 5 (DEX program filter) · `--page-size` `10/20/30/40/60/100`.

**`price-history`**: `--from-time`/`--to-time` are **`YYYYMMDD`**, not unix timestamps.

**`transfers`**: comma-separated `--from`/`--exclude-from`/`--to`/`--exclude-to` max 5 · `--amount`/`--value` are single flags in `min,max` comma-separated form · `--sort-by` `block_time` · `--page-size` `10/20/30/40/60/100`.

**`defi` / `defi-export`**: `--source` comma-separated max 5 · `--value <min>,<max>` comma-separated USD range · `defi-export` adds `--platform` (comma-separated max 5), drops pagination.

Transfer/DeFi `--activity-type` enums are the same lists as in [account.md](account.md) (`ACTIVITY_SPL_*` for transfers, `ACTIVITY_TOKEN_*`/`ACTIVITY_*` for DeFi).

**`historical`**: `--range` `7`\|`30` days only.

**`search`**: `--search-mode` `exact`(default)\|`fuzzy` · `--search-by` `combination`(default)\|`address`\|`name`\|`symbol` · `--exclude-unverified` boolean flag · `--sort-by` `reputation`(default)\|`market_cap`\|`volume_24h` · `--page-size` `10/20/30/40`.

**`list`**: `--sort-by` `holder`\|`market_cap`(default)\|`created_time` · `--page-size` `10/20/30/40/60/100`.

**`latest`**: `--platform-id` one of `jupiter`, `lifinity`, `meteora`, `orca`, `raydium`, `phoenix`, `sanctum`, `kamino`, `pumpfun`, `openbook`, `apepro`, `stabble`, `jupiterdca`, `jupiter_limit_order`, `solfi`, `zerofi`, `letsbonkfun_launchpad`, `raydium_launchlab`, `believe_launchpad`, `moonshot_launchpad`, `jup_studio_launchpad`, `bags_launchpad`. `--page-size` `10/20/30/40/60/100`.

## Response Fields

Field-by-field description of each action's JSON response (types, meaning, edge cases): [responses/token.md](responses/token.md) (envelope) → [responses/token-info.md](responses/token-info.md) (`meta`, `meta-multi`) / [responses/token-activity.md](responses/token-activity.md) (`transfers`, `defi`, `defi-export`) / [responses/token-market.md](responses/token-market.md) (`markets`).

## Examples

```bash
solscan token trending
solscan token meta --address So11111111111111111111111111111111111111112

# Latest price, multiple tokens
solscan token price-latest --addresses So11111111111111111111111111111111111111112,EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Historical price (YYYYMMDD dates)
solscan token price-history --addresses So11111111111111111111111111111111111111112 --from-time 20240701 --to-time 20240715

# All markets for a token, vs a specific pair
solscan token markets --token So11111111111111111111111111111111111111112
solscan token markets --token So11111111111111111111111111111111111111112,EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

solscan token list --sort-by holder --sort-order desc --page-size 20
solscan token latest --platform-id pumpfun --page-size 20
solscan token historical --address So11111111111111111111111111111111111111112 --range 30

# Fuzzy name search
solscan token search --keyword "bonk" --search-mode fuzzy --sort-by market_cap
solscan token search --keyword "USDC" --search-by symbol --exclude-unverified

# Holders filtered by USD value range
solscan token holders --address EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --from-value 10000 --to-value 100000

solscan token defi-export --address So11111111111111111111111111111111111111112 --output sol-defi.csv
```
