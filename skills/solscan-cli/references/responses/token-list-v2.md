# Token Response Fields — List V2 (screener)

Field-by-field description of the JSON that `token list-v2` returns. Read this when you need to interpret or extract fields from the response. For flags, metric names and the filter caveats, see [../token.md](../token.md). Shared envelope/error shape: [token.md](token.md#common-envelope).

`list-v2` is a **metrics table, not an identity listing**. Each row is one token's trading/holder statistics keyed only by `token_address`. Unlike `list`/`top` ([token-list.md](token-list.md)), rows carry no `name`, `symbol`, `decimals` or `price`.

## Contents

- [Envelope](#envelope)
- [Row fields](#row-fields)
- [Quirks seen in live data](#quirks-seen-in-live-data)
- [Example](#example)

## Envelope

| Field | Type | Description |
|-------|------|--------------|
| `data.list_tokens` | array of object | The rows for this page (`--page-size` of them, fewer on the last page). |
| `data.total` | number | Number of matching tokens, **capped at 10000**. With no filters it reads `10000`; with filters it is the real count when below the cap (e.g. `338` for `market_cap` between $1M and $5M). |
| `metadata` | object | Envelope-level sibling, `{}` in practice. |

Only the first 10,000 matching rows are reachable: a page past that window comes back with `list_tokens: []` and `total: 0`. A page past the end of a smaller result set comes back with `list_tokens: []` and the real `total`. Either way, an empty `list_tokens` means stop paging.

## Row fields

Every row has the same 193 keys.

| Field(s) | Type | Description |
|-------|------|--------------|
| `token_address` | string | Token mint. The only identity field; resolve names with `token meta-multi`. |
| `volume_<w>`, `buy_volume_<w>`, `sell_volume_<w>` | number | Total / buy-side / sell-side trading volume in USD over window `<w>`. |
| `num_trade_<w>`, `num_buy_trade_<w>`, `num_sell_trade_<w>` | number | Trade counts over `<w>`. |
| `num_trader_<w>`, `num_buyer_<w>`, `num_seller_<w>` | number | Unique wallets trading / buying / selling over `<w>`. `num_buyer + num_seller` can exceed `num_trader` because a wallet can do both. |
| `<any of the above>_change_pct` | number | % change vs. the previous window of the same length (e.g. `volume_1h_change_pct` = last hour vs. the hour before). |
| `price_<w>_change_pct` | number | USD price change % over `<w>`. There is **no absolute price field**; use `token price-latest` for that. |
| `trader_hhi_24h` | number | Herfindahl-Hirschman index of 24h volume across traders, 0–1. Near 1 means a few wallets dominate trading. |
| `trader_top_{1,5,20,100}_volume_pct_24h` | number | % of 24h volume (0–100) from the top 1/5/20/100 traders. High `top_1` values can signal wash trading. |
| `market_cap`, `fdv`, `liquidity` | number | USD. `liquidity` is summed across all of the token's pools. |
| `total_supply`, `circulating_supply` | number | Supply in UI units (already divided by decimals). |
| `num_pool`, `num_holder` | number | Pool count and holder count. |
| `first_listing_time` | number | Unix seconds when the token was first listed/traded. |
| `holder_gini` | number | Gini coefficient of holder balances, 0 (equal) – 1 (fully concentrated). |
| `holder_hhi` | number | HHI of holder balances, 0–1. |
| `holder_top_{1,5,20,100}_balance_pct` | number | % of supply (0–100) held by the top 1/5/20/100 holders. Pools, CEX and burn wallets count as holders, so check before calling a token "concentrated". |
| `platform` | array of string | Launch/listing platforms, e.g. `["pumpfun"]` or `["stonkfun_launchpad","raydium"]`. **Empty `[]` for most established tokens** (SOL, USDC), so an empty array doesn't mean "no DEX". |
| `updated_time` | number | Unix seconds when this row's metrics were last refreshed. |

Windows `<w>`: `1m`, `5m`, `30m`, `1h`, `4h`, `8h`, `24h`, `7d`, `30d`.

## Quirks seen in live data

- **SOL has `first_listing_time = 0`** (no listing time recorded). Don't read it as a 1970 listing date; it also falls outside any `--filter first_listing_time=<from>,` window.
- **`*_change_pct` can be in the thousands of percent or more** when the previous window had near-zero activity. Before ranking by a change %, add a floor on the matching absolute metric (e.g. `--filter volume_24h=50000,`) to cut out dust.
- **Default sort is `volume_1m`**, a very short window, so the order shifts from minute to minute. Pass `--sort-by volume_24h` (or whatever the question is about) for a stable ranking.

## Example

Captured live (`solscan token list-v2 --sort-by volume_24h`, Oct 2026). One row shown with the `1m`–`8h`, `7d` and `30d` windows and some 24h/holder fields elided for brevity; real rows have all 193 keys.

```json
{
  "success": true,
  "data": {
    "list_tokens": [
      {
        "token_address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "volume_24h": 1316595542.5309563,
        "volume_24h_change_pct": 12.457947672956308,
        "buy_volume_24h": 662243567.9828814,
        "sell_volume_24h": 654351974.5480747,
        "num_trade_24h": 6322122,
        "num_buy_trade_24h": 3042171,
        "num_sell_trade_24h": 3279951,
        "num_trader_24h": 278217,
        "num_buyer_24h": 241032,
        "num_seller_24h": 242926,
        "price_24h_change_pct": 0,
        "trader_hhi_24h": 0.011623329797339623,
        "trader_top_1_volume_pct_24h": 6.544243535187818,
        "trader_top_100_volume_pct_24h": 60.634756210894416,
        "market_cap": 8183078108.457944,
        "total_supply": 8189594443.183226,
        "liquidity": 700908602.0485622,
        "num_pool": 558886,
        "num_holder": 9232450,
        "fdv": 8189594443.183226,
        "circulating_supply": 8183078108.457944,
        "first_listing_time": 1602610673,
        "holder_gini": 0.9973142781602349,
        "holder_hhi": 0.029879036214617502,
        "holder_top_1_balance_pct": 14.53903089143778,
        "holder_top_100_balance_pct": 50.53843434551714,
        "updated_time": 1791253881,
        "platform": []
      }
    ],
    "total": 10000
  },
  "metadata": {}
}
```
