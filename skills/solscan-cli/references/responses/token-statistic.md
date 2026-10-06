# Token Response Fields — Statistic

Field-by-field description of the JSON that `token statistic` returns. Read this when you need to interpret or extract fields from the response. For flags, see [../token.md](../token.md). Shared envelope/error shape: [token.md](token.md#common-envelope).

`statistic` returns **one token's metrics object, keyed by address**. It is the exact same 193-key object as one row of `list-v2`, with the same values at the same `updated_time`, so the field table in [token-list-v2.md](token-list-v2.md#row-fields) applies unchanged. This file only covers what differs: the envelope, the empty-result case, and quirks you'll hit when reading a single token.

## Contents

- [Envelope](#envelope)
- [Fields at a glance](#fields-at-a-glance)
- [Quirks seen in live data](#quirks-seen-in-live-data)
- [Example](#example)

## Envelope

| Field | Type | Description |
|-------|------|--------------|
| `data` | object | The metrics object for `--address`. **`{}` (empty) when the address has no stats** — see below. |
| `metadata` | object | Envelope-level sibling, `{}` in practice. |

**Empty `data: {}` with `success: true` (HTTP 200)** comes back when:
- the address is a valid base58 key but not a token (e.g. a wallet address), or
- the token is real but not indexed yet — a pump.fun mint returned by `token latest` a few minutes after creation had no stats, while tokens already in `list-v2` did.

Tell the user stats aren't available for that address rather than reporting zeros. A malformed address returns `400` (`Validation Error: Address [...] is invalid`), and a missing `--address` is caught by the CLI before any call.

## Fields at a glance

`<w>` ∈ `1m`, `5m`, `30m`, `1h`, `4h`, `8h`, `24h`, `7d`, `30d`. Full meanings → [token-list-v2.md](token-list-v2.md#row-fields).

| Group | Fields |
|-------|--------|
| Identity | `token_address` only. No name/symbol/decimals; use `token meta`. |
| Activity (USD / counts) | `volume_<w>`, `buy_volume_<w>`, `sell_volume_<w>`, `num_trade_<w>`, `num_buy_trade_<w>`, `num_sell_trade_<w>`, `num_trader_<w>`, `num_buyer_<w>`, `num_seller_<w>`, each with a `_change_pct` sibling (vs. the previous window of the same length) |
| Price change | `price_<w>_change_pct`. No absolute price; use `token price-latest`. |
| Market | `market_cap`, `fdv`, `liquidity` (USD, summed over all pools), `total_supply`, `circulating_supply` (UI units), `num_pool`, `num_holder`, `first_listing_time` (unix s) |
| Trader concentration (24h) | `trader_hhi_24h` (0–1), `trader_top_{1,5,20,100}_volume_pct_24h` (0–100) |
| Holder concentration | `holder_gini`, `holder_hhi` (0–1), `holder_top_{1,5,20,100}_balance_pct` (0–100) |
| Other | `platform` (array of launch/listing platforms, often `[]`), `updated_time` (unix s, when the metrics were last refreshed) |

## Quirks seen in live data

- **SOL (`So111…112`) reflects wrapped SOL only.** `market_cap` ≈ $1.5B and `total_supply` ≈ 12.2M are the wSOL mint's figures, not native SOL's network market cap. `first_listing_time` is `0`. For SOL's real market cap, don't use this endpoint.
- **`circulating_supply` can be slightly larger than `total_supply`** (seen on SOL). The two are computed separately; don't derive a "locked %" from their difference.
- **Stablecoins show `price_<w>_change_pct = 0`** across windows (USDC), so a zero isn't missing data.
- **`*_change_pct` explodes on thin tokens**: when the previous window had near-zero activity the % can be in the thousands, and on a brand-new token every `_change_pct` is `0` because there is no previous window. Read them next to the absolute metric.
- **New launchpad tokens** have tiny absolute numbers and extreme concentration, e.g. a fresh pump.fun token with `num_holder: 3`, `holder_top_1_balance_pct: 99.6`, `liquidity` ≈ $13. The bonding-curve account counts as a holder, so check `token holders` before calling such a token a rug.
- **Metrics refresh in a batch roughly every 2 minutes**, and every token carries the same `updated_time`. Repeated calls inside that interval return identical numbers, and the `1m`/`5m` windows can be up to ~2 minutes old. Compare `updated_time` to now before calling something "live".

## Example

Captured live (`solscan token statistic --address DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`, BONK, Oct 2026). Only the `24h` window plus two price windows are shown; real responses have all 193 keys.

```json
{
  "success": true,
  "data": {
    "token_address": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    "volume_24h": 1935376.2974492405,
    "volume_24h_change_pct": 40.44722537463861,
    "buy_volume_24h": 935984.4613276917,
    "sell_volume_24h": 999391.8361215487,
    "num_trade_24h": 60793,
    "num_buy_trade_24h": 29255,
    "num_sell_trade_24h": 31538,
    "num_trader_24h": 6990,
    "num_trader_24h_change_pct": -1.3826185101580135,
    "num_buyer_24h": 6415,
    "num_seller_24h": 6578,
    "price_1h_change_pct": -1.0525183916342056,
    "price_24h_change_pct": -6.4435999134390425,
    "price_7d_change_pct": 1.3229141810865288,
    "trader_hhi_24h": 0.03113807375775994,
    "trader_top_1_volume_pct_24h": 12.346096735262279,
    "trader_top_5_volume_pct_24h": 31.00109957789698,
    "trader_top_20_volume_pct_24h": 57.72460670937527,
    "trader_top_100_volume_pct_24h": 85.75300888644844,
    "market_cap": 331032800.9390144,
    "total_supply": 87994371649542.64,
    "liquidity": 2604002.212160283,
    "num_pool": 3164,
    "num_holder": 1024523,
    "fdv": 330526633.51631933,
    "circulating_supply": 87994365017146.94,
    "first_listing_time": 1670531612,
    "holder_gini": 0.9977191752862178,
    "holder_hhi": 0.021898058596597766,
    "holder_top_1_balance_pct": 8.830696217481924,
    "holder_top_5_balance_pct": 25.350782678454394,
    "holder_top_20_balance_pct": 50.2489869953483,
    "holder_top_100_balance_pct": 77.9214636252668,
    "updated_time": 1791255090,
    "platform": []
  },
  "metadata": {}
}
```

Empty result (wallet address, or a token not indexed yet):

```json
{ "success": true, "data": {}, "metadata": {} }
```
