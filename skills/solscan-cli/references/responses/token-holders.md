# Token Response Fields — Holders

Field-by-field description of the JSON the `token holders` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../token.md](../token.md) for flags/params). Shared envelope/error shape: [token.md](token.md#common-envelope).

This covers **holder distribution and ranking** for a token — who holds it, how much, and what share of supply — as opposed to identity/supply metadata ([token-info.md](token-info.md)) or a time-ordered transfer/DeFi log ([token-activity.md](token-activity.md)).

## Contents

- [`holders`](#holders)

> Only actions with a confirmed field-level source are documented here. If the action you need isn't listed yet, fall back to the `--no-json` output or `--help`, and treat unlabeled fields at face value rather than guessing their meaning.

## `holders`

`solscan token holders --address <TOKEN_ADDRESS> [--page <n>] [--page-size <n>] [--from-amount <raw>] [--to-amount <raw>] [--from-value <usd>] [--to-value <usd>]`

`data` is a single **object** (not an array) with two fields:

| Field | Type | Description |
|-------|------|--------------|
| `total` | number | Count of holders matching the current query — see interpretation tips, this is filter-scoped, not necessarily the token's full holder count. |
| `items` | array of object | One entry per holder, ordered by holding amount descending. Page through with `--page`/`--page-size` (`page-size` accepts only `10`/`20`/`30`/`40` — any other value gets a `400`). |

Each entry in `items`:

| Field | Type | Description |
|-------|------|--------------|
| `address` | string | The **token account** (ATA) address holding the balance — not a wallet address. |
| `amount` | number | Holding amount in raw base units (before applying `decimals`). Can exceed JS's safe integer range for large-supply, high-decimal tokens — prefer `amount_str` for exact values. |
| `amount_str` | string | Same value as `amount`, string-encoded for precision. Parse with a bignum-safe method and divide by `10 ** decimals` for the human-readable amount. |
| `decimals` | number | Decimals for this token (same value as `token meta`'s `decimals` for this mint). |
| `owner` | string | The **wallet** (or program) address that controls the token account in `address`. This is usually what you want when identifying "who" holds the token, since `address` is just the account, not the holder's wallet. |
| `rank` | number | 1-indexed rank by holding amount **within the current query's result set** — see interpretation tips, this is not a fixed global rank once `from_amount`/`to_amount`/`from_value`/`to_value` filters are applied. |
| `value` | number | Holding value in USD, computed from the token's price at query time (same live-price caveat as `token meta`'s `price` field — it drifts call to call). |
| `percentage` | number | Holding share of total token supply, e.g. `9.617460814963485` means ~9.62% of total supply, not a 9.62x multiple. |

**Example** (`solscan token holders --address EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --page-size 10`, unfiltered — top of USDC's holder list, trimmed to 2 rows — captured 2026-08-19)

```json
{
  "success": true,
  "data": {
    "total": 8091170,
    "items": [
      {
        "address": "3emsAVdmGKERbHjmGfQ6oZ1e35dkf5iYcS6U4CPKFVaa",
        "amount": 722789162531970,
        "amount_str": "722789162531970",
        "decimals": 6,
        "owner": "7VHUFJHWu2CuExkJcJrzhQPJ2oygupTWkL2A2For4BmE",
        "rank": 1,
        "value": 722789162.53197,
        "percentage": 9.617460814963485
      },
      {
        "address": "DT78gNBH7enTRrAFcag4PAuQbSeemstmtj888w8pkvdf",
        "amount": 515359813601000,
        "amount_str": "515359813601000",
        "decimals": 6,
        "owner": "H8BgJgae6qhMtf7BM2JtddywSQt11WdxHHxkGLNX5hss",
        "rank": 2,
        "value": 515359813.601,
        "percentage": 6.857397799867083
      }
    ]
  },
  "metadata": {}
}
```

**Same token, filtered by USD value band** (`solscan token holders --address EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --page-size 10 --from-value 1000 --to-value 5000000`, trimmed to 2 rows — captured 2026-08-19)

```json
{
  "success": true,
  "data": {
    "total": 115664,
    "items": [
      {
        "address": "4JdJK2X6PVT3BhhGDYmrZsaqdeHqVLg7Ma3ZM6ETnojt",
        "amount": 4862182308403,
        "amount_str": "4862182308403",
        "decimals": 6,
        "owner": "2FUNdgyGtGQAffBJ1UYPZrhgu4FSUStsohEzkPbUctnu",
        "rank": 1,
        "value": 4862182.308403,
        "percentage": 0.06469638761940652
      },
      {
        "address": "Eaije4eGKepBQrQh4t2ZDvojsBVfnoDihpQZQ2476RJT",
        "amount": 4692254838931,
        "amount_str": "4692254838931",
        "decimals": 6,
        "owner": "DtbRsDtjkp6iCy6Z8Sp2xJzKGvJm8hNXiptnBmVsN1nZ",
        "rank": 2,
        "value": 4692254.838931,
        "percentage": 0.06243532607649693
      }
    ]
  },
  "metadata": {}
}
```

Note `total` dropped from `8091170` to `115664` and `rank` restarted at `1` once the `--from-value`/`--to-value` band excluded the whales above $5M — same token, same moment, different query scope.

**Interpretation tips**

- `total` and `rank` are both computed **against the active filter set**, not the token's unfiltered holder base. Applying any of `--from-amount`, `--to-amount`, `--from-value`, `--to-value` shrinks `total` to just the matching holders and re-ranks `items` starting from `1` within that band — don't treat `rank` as a stable, filter-independent leaderboard position, and don't treat a filtered `total` as the token's real holder count.
- For the token's actual total holder count (unaffected by any `holders` filter), use `token meta`'s `holder` field instead — an unfiltered `token holders` call's `total` should closely track it, but they're computed independently and can drift slightly (e.g. `8091170` here vs. `8090955` from a `token meta` call made moments earlier/later — see [token-info.md](token-info.md)).
- `address` (the token account) and `owner` (the controlling wallet) are easy to conflate — when the user asks "who holds this token," report `owner`, not `address`. A single wallet can technically appear as `owner` on more than one row if it holds the token through multiple token accounts (rare, but don't assume `owner` values are unique across `items`).
- `amount` is a raw JS `number` and can silently lose precision above `Number.MAX_SAFE_INTEGER` (2^53) for tokens combining high supply and high `decimals` — always prefer `amount_str` when exactness matters (e.g. summing holdings, comparing two holders' exact balances), and divide by `10 ** decimals` only after parsing it as a bignum/decimal type.
- `from_amount`/`to_amount` are raw base-unit strings (same units as `amount_str`, **not** human-readable token amounts — a token with 6 decimals needs `1000000` for "1.0 token"), while `from_value`/`to_value` are plain USD numbers. Don't mix the two: passing a human-readable amount to `--from-amount` on a 6-9 decimal token will filter far too aggressively.
- `--page-size` only accepts `10`/`20`/`30`/`40` (confirmed live — other values return a `400 Bad Request`) — this is a smaller enum than most other paginated `token`/`account` actions (which commonly also allow `60`/`100`), so don't assume the wider range applies here.
- `value` and `percentage` both derive from data that moves in real time (price for `value`, circulating supply for `percentage`) — treat both as point-in-time snapshots, not fields you can safely cache or compare across calls made minutes apart.
