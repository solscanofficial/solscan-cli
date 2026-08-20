# Token Response Fields — Historical

Field-by-field description of the JSON the `token historical` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../token.md](../token.md) for flags/params). Shared envelope/error shape: [token.md](token.md#common-envelope).

This covers a **daily time series for one token** — supply, holder count, transfer count, and buy/sell volume/amount per day over a fixed window — as opposed to a live snapshot ([token-info.md](token-info.md), [token-list.md](token-list.md)) or a spot/historical **price** series ([token-price.md](token-price.md)). `historical` has no `price` field at all; pair it with `price-history` if you need both trend shapes for the same token.

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
| `date` | number | Day as a `YYYYMMDD` integer (e.g. `20260814`), **not** a unix timestamp — same format family as `price-history`'s `date`, but this is a distinct series computed independently. |
| `supply` | number | Circulating supply on that day, already **human-readable** (`decimals` already applied) — not raw base units, unlike the raw-amount fields below or `token holders`' `amount` field. |
| `num_holders` | number | Holder count on that day. |
| `num_transfers` | number | Total SPL transfers involving this token that day. |
| `num_buyers` | number | Distinct buyer count that day. |
| `num_sellers` | number | Distinct seller count that day. |
| `total_volume_buying` | number | Buy-side volume that day, in **USD**. |
| `total_volume_selling` | number | Sell-side volume that day, in **USD**. |
| `total_trade_volume` | number | Combined buy + sell volume for the day, in **USD** — closely tracks `total_volume_buying + total_volume_selling` (e.g. `821.7663 + 1012694.06 = 1013515.83` vs. `total_trade_volume: 1013515.83` in the example below), with any small remainder likely sub-cent rounding rather than a separately-sourced figure. |
| `total_amount_buying` | number | Buy-side trade amount that day, in **raw token base units** (not decimal-adjusted). |
| `total_amount_selling` | number | Sell-side trade amount that day, in **raw token base units** (not decimal-adjusted). |
| `total_trade_amount` | number | Combined buy + sell trade amount for the day, in **raw token base units** — closely tracks `total_amount_buying + total_amount_selling` (e.g. `9613332000 + 11793632000000 = 11803245332000` vs. `total_trade_amount: 11803245578305` in the example below), same rounding caveat as `total_trade_volume`. |

**Example** (`solscan token historical --address BNso1VUJnh4zcfpZa6986Ea66P6TCp59hvtNJ8b1X85 --range 7`, trimmed to 2 of the 7 rows, per Solscan's published reference):

```json
{
  "success": true,
  "data": {
    "token_address": "BNso1VUJnh4zcfpZa6986Ea66P6TCp59hvtNJ8b1X85",
    "data": [
      {
        "date": 20260814,
        "supply": 9105493.466396231,
        "num_holders": 14578,
        "num_transfers": 3177,
        "total_volume_buying": 821.7663,
        "total_volume_selling": 1012694.06,
        "total_trade_amount": 11803245578305,
        "num_buyers": 85,
        "num_sellers": 86,
        "total_amount_buying": 9613332000,
        "total_amount_selling": 11793632000000,
        "total_trade_volume": 1013515.83
      },
      {
        "date": 20260815,
        "supply": 9036227.107487136,
        "num_holders": 14590,
        "num_transfers": 3013,
        "total_volume_buying": 16983.15,
        "total_volume_selling": 5943329.5,
        "total_trade_amount": 70290499229539,
        "num_buyers": 80,
        "num_sellers": 91,
        "total_amount_buying": 199762070000,
        "total_amount_selling": 70090737000000,
        "total_trade_volume": 5960312.65
      }
    ]
  },
  "metadata": {}
}
```

**Interpretation tips**

- There is **no `price`, `market_cap`, or `price_24h_change` field anywhere in this response** — despite the name overlap with `token list`/`top`/`meta`, `historical` tracks supply/holder/transfer/trade-volume trends only. For a price trend on the same token, call `token price-history` separately and correlate by `date`.
- **Don't confuse the `_volume_`/`_amount_` field families by name alone** — `total_volume_buying`, `total_volume_selling`, and `total_trade_volume` are USD figures; `total_amount_buying`, `total_amount_selling`, and `total_trade_amount` are raw token base units (not USD, and not decimal-adjusted like `supply` is). The naming is easy to misread at a glance — `total_trade_amount` looks like it should pair with the `_volume_` fields but it's actually the raw-unit counterpart of `total_trade_volume`.
- `--range` only accepts `7` or `30` — there's no arbitrary date window (`--from-time`/`--to-time` don't apply here, unlike `transfers`/`defi`). If you need a custom window, page through `token transfers`/`token defi` instead and aggregate yourself.
- Row count in `data` should equal `--range`, but a very young token can have fewer rows than requested (no data exists for days before it was created) — don't assume a short array means the request failed.
- `num_holders`/`supply` here are the token's own daily-snapshot values, independently computed from the live `holder`/current-supply fields returned by `token meta`/`token holders` — expect them to be close but not necessarily identical at the boundary day, since one is a live read and the other is an end-of-day rollup.
- If you need raw trade amounts in human-readable units, divide `total_amount_buying`/`total_amount_selling`/`total_trade_amount` by `10^decimals` yourself (fetch `decimals` via `token meta`) — this response doesn't do that scaling for you, unlike `supply` which already has it applied.
