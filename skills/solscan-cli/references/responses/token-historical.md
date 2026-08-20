# Token Response Fields — Historical

Field-by-field description of the JSON the `token historical` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../token.md](../token.md) for flags/params). Shared envelope/error shape: [token.md](token.md#common-envelope).

This covers a **daily time series for one token** — supply, holder count, transfer count, and buy/sell volume per day over a fixed window — as opposed to a live snapshot ([token-info.md](token-info.md), [token-list.md](token-list.md)) or a spot/historical **price** series ([token-price.md](token-price.md)). `historical` has no `price` field at all; pair it with `price-history` if you need both trend shapes for the same token.

## Contents

- [`historical`](#historical)

> Only actions with a confirmed field-level source are documented here. If the action you need isn't listed yet, fall back to the `--no-json` output or `--help`, and treat unlabeled fields at face value rather than guessing their meaning.

## `historical`

`solscan token historical --address <TOKEN_ADDRESS> [--range <7|30>]` — `--range` is the only other param (default `7`, days); there's no pagination and no other filter, so the row count is fixed by `--range`, not something you page through.

`data` is a single **object**, not an array directly:

| Field | Type | Description |
|-------|------|--------------|
| `token_address` | string | Echoes the queried `--address`. |
| `data` | array of object | One row per day, oldest first, covering the requested `--range` window (see per-row fields below). |

Each entry in `data`:

| Field | Type | Description |
|-------|------|--------------|
| `date` | number | Day as a `YYYYMMDD` integer (e.g. `20251125`), **not** a unix timestamp — same format family as `price-history`'s `date`, but this is a distinct series computed independently. |
| `supply` | number | Circulating supply on that day, already **human-readable** (`decimals` already applied) — not raw base units, unlike `token holders`' `amount` field. |
| `num_holders` | number | Holder count on that day. |
| `num_transfers` | number | Total SPL transfers involving this token that day. |
| `total_volume_buying` | number | Aggregate buy-side volume that day, in **USD**. |
| `total_volume_selling` | number | Aggregate sell-side volume that day, in **USD**. |
| `total_trade_amount` | number | Combined buy + sell trade volume for the day, in **USD** — closely tracks `total_volume_buying + total_volume_selling` (e.g. `418293 + 17902932 = 18321225` vs. `total_trade_amount: 18321225.90625` in the example below), with the small remainder likely sub-cent rounding rather than a separately-sourced figure. |
| `num_buyers` | number | Distinct buyer count that day. |
| `num_sellers` | number | Distinct seller count that day. |

**Example** (`solscan token historical --address BNso1VUJnh4zcfpZa6986Ea66P6TCp59hvtNJ8b1X85 --range 7`, trimmed to 2 of the 7 rows, per Solscan's published reference):

```json
{
  "success": true,
  "data": {
    "token_address": "BNso1VUJnh4zcfpZa6986Ea66P6TCp59hvtNJ8b1X85",
    "data": [
      {
        "date": 20251125,
        "supply": 7876083.996080263,
        "num_holders": 13320,
        "num_transfers": 750,
        "total_volume_buying": 418293,
        "total_volume_selling": 17902932,
        "total_trade_amount": 18321225.90625,
        "num_buyers": 43,
        "num_sellers": 42
      },
      {
        "date": 20251126,
        "supply": 7885300.56188911,
        "num_holders": 13313,
        "num_transfers": 350,
        "total_volume_buying": 1400612,
        "total_volume_selling": 15315,
        "total_trade_amount": 1415927.66015625,
        "num_buyers": 36,
        "num_sellers": 31
      }
    ]
  },
  "metadata": {}
}
```

**Interpretation tips**

- There is **no `price`, `market_cap`, or `price_24h_change` field anywhere in this response** — despite the name overlap with `token list`/`top`/`meta`, `historical` tracks supply/holder/transfer/trade-volume trends only. For a price trend on the same token, call `token price-history` separately and correlate by `date`.
- `--range` only accepts `7` or `30` — there's no arbitrary date window (`--from-time`/`--to-time` don't apply here, unlike `transfers`/`defi`). If you need a custom window, page through `token transfers`/`token defi` instead and aggregate yourself.
- Row count in `data` should equal `--range`, but a very young token can have fewer rows than requested (no data exists for days before it was created) — don't assume a short array means the request failed.
- `num_holders`/`supply` here are the token's own daily-snapshot values, independently computed from the live `holder`/current-supply fields returned by `token meta`/`token holders` — expect them to be close but not necessarily identical at the boundary day, since one is a live read and the other is an end-of-day rollup.
- `total_volume_buying`/`total_volume_selling`/`total_trade_amount` are **USD** figures, not raw token amounts, and `supply` is already human-readable — none of these need `decimals` scaling, unlike `token holders`' `amount`/`amount_str`.
