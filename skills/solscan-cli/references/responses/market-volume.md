# Market Response Fields — Volume

Field-by-field description of the JSON the `market volume` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../market.md](../market.md) for flags/params).

This covers a **single pool's daily volume/TVL time series** — as opposed to its static reserve/creation info ([market-info.md](market-info.md)) or the bulk activity-ranked listing ([market-list.md](market-list.md)).

## `volume`

`solscan market volume --address <POOL_ADDRESS> [--time <start>,<end>]`

`data` is a single **object**. `--time` filters the `days` series to a `YYYYMMDD` start/end window (e.g. `--time 20240701,20240715`); omit it to get the API's default window.

| Field | Type | Description |
|-------|------|--------------|
| `pool_address` | string | The pool address (echoes `--address`). |
| `program_id` | string | Address of the DEX/AMM program that owns the pool. |
| `total_volume_24h` | number | Trading volume in the last 24h. |
| `total_volume_change_24h` | number | Percentage change in volume vs. the prior 24h window (can be negative). |
| `total_trades_24h` | number | Number of trades in the last 24h. |
| `total_trades_change_24h` | number | Percentage change in trade count vs. the prior 24h window. |
| `tvl` | number | Total value locked in the pool. Present in Solscan's schema but absent from worked examples — treat as optionally present (see interpretation tips). |
| `days` | array | One entry per day in the requested window — see below. |
| `days[].day` | number | Date as an integer in `YYYYMMDD` form (e.g. `20241114`). |
| `days[].volume` | number | Same meaning as `value`; named this way in Solscan's schema instead. |
| `days[].tvl` | number | That day's total value locked, per Solscan's schema. Not present in worked examples. |

**Example** (`solscan market volume --address 7eexH14UjhNxJe6zTT3f1Vb1E8iACsBMVaWheDEmxdT2 --time 20241114,20241115`)

```json
{
  "success": true,
  "data": {
    "pool_address": "8FnX3xo2yYw3EUE6w3nQA4GfXGS9wpK6oj3veJpbFzLo",
    "program_id": "BiSoNHVpsVZW2F7rx2eQ59yQwKxzU5NvBcmKshCSUypi",
    "total_volume_24h": 304611613.389828,
    "total_volume_change_24h": 35.823379646808974,
    "total_trades_24h": 1055390,
    "total_trades_change_24h": 13.266470214802112,
    "tvl": 4154910.8375637624,
    "days": [
      {
        "day": 20260801,
        "volume": 432.68027384624384,
        "tvl": 2884540.8
      },
      {
        "day": 20260802,
        "volume": 581.146838081699,
        "tvl": 2925848.1
      },
      {
        "day": 20260803,
        "volume": 14.503505428527951,
        "tvl": 2848321.8
      },
      {
        "day": 20260804,
        "volume": 0.07316757511174678,
        "tvl": 2572264.6
      },
      {
        "day": 20260805,
        "volume": 841.9703831684106,
        "tvl": 2790273.3
      }
    ]
  }
}
```

**Interpretation tips**

- `total_volume_change_24h` / `total_trades_change_24h` are already percentages (e.g. `-38.36` means -38.36%), not fractions — don't multiply by 100 again.
- `--time` takes exactly a start/end pair in `YYYYMMDD` (comma-separated in the CLI flag; sent to the API as two `time[]` query values) — it is a range filter, not a list of arbitrary dates.
- For the pool's current token reserves (not historical), use `market info --address <pool_address>` instead.
