# Token Response Fields

Field-by-field description of the JSON each `token <action>` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../token.md](../token.md) for flags/params).

> Only actions with a confirmed field-level source are documented here. If the action you need isn't listed yet, fall back to the `--no-json` output or `--help`, and treat unlabeled fields at face value rather than guessing their meaning.

## Common envelope

Every action wraps its payload the same way:

| Field | Type | Description |
|-------|------|--------------|
| `success` | boolean | `true` on `200 OK`. |
| `data` | object \| array | The actual payload, shaped per action (see below). |

On failure (`400`/`401`/`403`/`429`/`500`), `success` is `false` and `data` is replaced by:

| Field | Type | Description |
|-------|------|--------------|
| `errors.code` | number | API error code (distinct from the HTTP status). |
| `errors.message` | string | Human-readable error description, e.g. `"Validation Error: Address [...] is invalid"`. |

## Contents

- [`transfers`](#transfers)
- [`defi`](#defi)
- [`defi-export`](#defi-export)

## `transfers`

`solscan token transfers --address <TOKEN_ADDRESS> [filters...]`

`data` is an **array** — one object per transfer of this token, ordered by `--sort-by` (default and currently only `block_time`) / `--sort-order` (default `desc`, newest first). No `total`/`has_next` metadata — page by incrementing `--page` until a response comes back with fewer than `--page-size` rows.

Each item in `data`:

| Field | Type | Description |
|-------|------|--------------|
| `block_id` | number | Slot number the transfer's transaction landed in. |
| `trans_id` | string | Transaction signature — feed into `transaction detail`/`transaction actions` for the full transaction. |
| `block_time` | number | Unix timestamp (seconds) of the slot. |
| `time` | string | Same instant as `block_time`, as an ISO-8601 string. |
| `activity_type` | string | One of the `ACTIVITY_SPL_*` enum values (full list in [../token.md](../token.md)) — the specific kind of transfer (plain transfer, burn, mint, stake move, etc.). |
| `from_address` | string | Source wallet/owner address. |
| `to_address` | string | Destination wallet/owner address. |
| `token_address` | string | Mint address of the transferred token — always equal to the queried `--address` for this endpoint (unlike `account transfers`, where the queried address is a wallet and `token_address` varies per row). |
| `token_decimals` | number | Decimals for `token_address` — divide `amount` by `10^token_decimals` for the human-readable amount. |
| `amount` | number | Raw transfer amount in the token's base units (not yet decimal-adjusted). |

**Example**

```json
{
  "success": true,
  "data": [
    {
      "block_id": 276312035,
      "trans_id": "4x6jxJFCgbjLACvXgqb3aRTsrSk6RSccfgreJLgF3wL4xmZ9897ZyPTxvVV7sbukGeNeMqLb12EtQpzrxzhEkeMC",
      "block_time": 1720408627,
      "time": "2024-07-08T03:17:07.000Z",
      "activity_type": "ACTIVITY_SPL_TRANSFER",
      "from_address": "J6vHZDKghn3dbTG7pcBLzHMnXFoqUEiHVaFfZxojMjXs",
      "to_address": "7rhxnLV8C77o6d8oz26AgK8x8m5ePsdeRawjqvojbjnQ",
      "token_address": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      "token_decimals": 5,
      "amount": 500000000
    }
  ]
}
```

**Interpretation tips**

- Always divide `amount` by `10 ** token_decimals` before displaying — the example row is `5000` tokens (`500000000 / 10^5`), not 500 million.
- `token_address` will always equal the `--address` you queried — unlike `account transfers` (a wallet-scoped equivalent that can return several different `token_address` values for one wallet), this endpoint is scoped to one token from the start.
- There's no `flow` field here (present on `account transfers`) — since the query is scoped to a token rather than a wallet, there's no single "queried address" for direction to be relative to. Use `--from`/`--to` to filter by direction, and read `from_address`/`to_address` directly per row.
- No `value` (USD) field is returned per row despite `--value` being a valid filter — you can filter by a USD range, but there's no field in the response to read the USD amount back from. If you need the per-row USD value, the wallet-scoped `account transfer-export`'s `Value` CSV column is the closest equivalent (when the counterpart wallet is known).
- The API doc's description for `--amount` mentions needing to "pass token address first" — that phrasing is boilerplate carried over from the wallet-scoped `account transfers` endpoint (where `--address` is a wallet and a separate `--token` filter scopes the amount range to one token). Here `--address` already is the token, so `--amount <min>,<max>` applies directly with no extra qualifier needed.

## `defi`

`solscan token defi --address <TOKEN_ADDRESS> [filters...]`

Same underlying activity feed as [`account defi`](account-activity.md#defi), just scoped by token instead of by wallet: `--address` here is the **token mint** you're asking about, and a row is returned whenever that mint appears on either leg of the activity (as `routers.token1` or `routers.token2`), regardless of which wallet initiated it. `data` is an **array** — one object per DeFi activity, ordered by `--sort-by` (default and currently only `block_time`) / `--sort-order` (default `desc`, newest first). No `total`/`has_next` metadata — page by incrementing `--page` until a response comes back with fewer than `--page-size` rows.

Each item in `data`:

| Field | Type | Description |
|-------|------|--------------|
| `block_id` | number | Slot number the activity's transaction landed in. |
| `trans_id` | string | Transaction signature — feed into `transaction detail`/`transaction actions` for the full transaction. |
| `block_time` | number | Unix timestamp (seconds) of the slot. |
| `time` | string | Same instant as `block_time`, as an ISO-8601 string. |
| `activity_type` | string | One of the `ACTIVITY_*` DeFi enum values (full list in [../token.md](../token.md), same set as `account defi`) — swap, liquidity, staking, borrowing, bridge, etc. |
| `from_address` | string | The wallet/account address that initiated the activity — **not** necessarily related to the queried `--address` token, since this endpoint is token-scoped rather than wallet-scoped. |
| `sources` | array of string | Program address(es) of the underlying pool(s)/venue(s) the activity routed through. |
| `platform` | array of string | Address(es) of the top-level protocol/aggregator(s) the activity is attributed to. |
| `value` | number | USD value of the activity, already decimal-adjusted (not a raw base-unit figure). |
| `routers` | object | The swap amounts and per-hop routing detail for this activity — see below. Shape varies by `activity_type`; fields not relevant to a given activity (e.g. no second leg for a single-sided stake/borrow action) may be absent. |

**`routers`** fields:

| Field | Type | Description |
|-------|------|--------------|
| `token1` | string | Mint address of the first token in the activity (e.g. the token sold in a swap). |
| `token1_decimals` | number | Decimals for `token1` — divide `amount1` by `10^token1_decimals` for the human-readable amount. |
| `amount1` | number | Raw amount of `token1` in base units. |
| `token2` | string | Mint address of the second token (e.g. the token bought in a swap). Absent for activities with no second leg. |
| `token2_decimals` | number | Decimals for `token2`. |
| `amount2` | number | Raw amount of `token2` in base units. |
| `child_routers` | array of object | One entry per pool hop actually executed (a direct single-pool swap has exactly one entry; a multi-hop or aggregator-split trade has several). Each entry repeats `token1`/`token1_decimals`/`amount1`/`token2`/`token2_decimals`/`amount2` for just that hop (amounts as **strings** here, unlike the numeric `routers.amount1`/`amount2`), plus `program_address` (the AMM/DEX program that executed the hop) and `pool_address` (the specific pool account used). |

**Example** (`ACTIVITY_TOKEN_SWAP` — a live response captured 2026-08-18)

```json
{
  "success": true,
  "data": [
    {
      "block_id": 440031153,
      "trans_id": "zEhqDrYkDpMP37idCMWD4qGT6WPSRR1Xj3MsX6CSq3SWbqXeX3yNuNjujHBHzNHjK58SHRgigDYAMV569YKCWrh",
      "block_time": 1787045098,
      "activity_type": "ACTIVITY_TOKEN_SWAP",
      "from_address": "9Xy24UkstuTYUmrma1cRBAayzc6DjjGq94NeVkBsQTWm",
      "sources": ["pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"],
      "platform": ["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],
      "value": 4.1929554001904545,
      "routers": {
        "token1": "Fog23ySq2DKAjmMfkCL8pYyv8XgLJFeXTJai5RxQpump",
        "token1_decimals": 6,
        "amount1": 93481056097,
        "token2": "So11111111111111111111111111111111111111112",
        "token2_decimals": 9,
        "amount2": 55260262,
        "child_routers": [
          {
            "token1": "Fog23ySq2DKAjmMfkCL8pYyv8XgLJFeXTJai5RxQpump",
            "token1_decimals": 6,
            "amount1": "93481056097",
            "token2": "So11111111111111111111111111111111111111112",
            "token2_decimals": 9,
            "amount2": "55260262",
            "program_address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA",
            "pool_address": "CN5RZXwstoRayC3AYVnZgpjU7fkk2K8frRmqQT2uqfDA"
          }
        ]
      },
      "time": "2026-08-18T09:24:58.000Z"
    },
    {
      "block_id": 440192470,
      "trans_id": "5oAL2CdQQaL39Vw6fvgn1Bz58d6bAKe7ZuqHQWKUHYB4eK6us3R9UdNXoN4d5tWbdShQuHyCZv5ojoiTochTZudk",
      "block_time": 1787112204,
      "activity_type": "ACTIVITY_LST_STAKE",
      "from_address": "8DTHNmXKaMo8CQhMPB73mEdrWp7PJLQ2PWcbCjwGjRVb",
      "sources": [
        "SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy"
      ],
      "platform": [
        "SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy"
      ],
      "value": 7.69443953884622,
      "routers": {
        "token1": "So11111111111111111111111111111111111111111",
        "token1_decimals": 9,
        "amount1": 100000000,
        "token2": "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
        "token2_decimals": 9,
        "amount2": 77134659
      },
      "time": "2026-08-19T04:03:24.000Z"
    }
  ]
}
```

**Interpretation tips**

- Always divide `amount1`/`amount2` (and `child_routers[].amount1`/`amount2`) by `10 ** token*_decimals` before displaying — these are raw base-unit amounts, not human-readable ones. In the example, `amount1: 93481056097` with `token1_decimals: 6` is `93481.056097` of the token, not the raw integer.
- `child_routers[].amount1`/`amount2` come back as **strings** while the top-level `routers.amount1`/`amount2` are **numbers** — normalize both through a bignum-safe parse rather than assuming one JS type throughout the payload.
- A normal swap always has a `routers` object with the aggregate `token1`/`amount1`/`token2`/`amount2` for the whole trade. When the swap is routed through an aggregator, `routers` additionally carries `child_routers` — one entry per underlying sub-swap/pool hop the aggregator combined into that route — so you can reconcile the aggregate amounts against the individual hops that produced them.
- `child_routers` tracks aggregator routing, not the `activity_type` label — the example above is `ACTIVITY_TOKEN_SWAP` (not `ACTIVITY_AGG_TOKEN_SWAP`) yet still has one `child_routers` entry, because `platform` shows it was executed via Jupiter's router. Check `platform`/`sources`/`child_routers` rather than `activity_type` alone to tell whether a given trade was aggregator-routed.
- Not every `activity_type` populates every `routers` field — a single-sided action like `ACTIVITY_SPL_INIT_MINT`or `ACTIVITY_TOKEN_DEPOSIT_VAULT`,... may only have a `token1`/`amount1` leg, with `token2`/`amount2`/`child_routers` absent rather than an error.
- `sources` (the pool/venue program(s) touched) and `platform` (the top-level protocol/aggregator attributed for the activity) are different axes — for a direct DEX swap they're often the same address; for an aggregated swap `platform` is the aggregator (e.g. Jupiter) while `sources` lists the underlying pool(s) it routed through.
- This endpoint has no total/count metadata. Use [`defi-export`](#defi-export) (same filters plus `--platform`, CSV output) for bulk export instead of paging through everything.

## `defi-export`

`solscan token defi-export --address <TOKEN_ADDRESS> [filters...] [--output <file>]`

Same filter set as [`defi`](#defi) (`--activity-type`, `--from`, `--source`, `--token`, `--from-time`/`--to-time`, `--sort-by`/`--sort-order`), plus `--platform` (comma-separated, max 5) and minus `--value`/`--page`/`--page-size` — this is the CSV/export twin of `defi`, not a rollup across multiple filters. The response is not JSON: it's a **raw CSV string** (`success`/`data` envelope does not apply). Without `--output`, the CLI prints the CSV text as-is to stdout; with `--output <file>`, it's written verbatim to disk via `saveToCsv()`. Capped at 5000 rows per request and rate-limited to 10 requests/minute — there's no default time window, so an unfiltered call attempts to export the token's entire DeFi history (subject to the 5000-row cap).

CSV columns mirror [`account defi-export`](account-activity.md#defi-export) (`Signature`, `Block Time`, `Human Time`, `Action`, `From`, `Token1`, `Amount1`, `TokenDecimals1`, `Token2`, `Amount2`, `TokenDecimals2`, `Value`, `Platforms`, `Sources`) — same column meanings, same `Action` formatting (`ACTIVITY_` prefix stripped, underscores turned into spaces), same `|`-joined `Platforms`/`Sources` for multiple values. See that section for the full column table and caveats (e.g. `Amount1`/`Amount2` can be `0` on a row with nonzero `Value`).

**Interpretation tips**

- Prefer `defi` (JSON, paginated) over `defi-export` (CSV, flattened) when you need the structured `routers` object / `sources` array directly; reserve `defi-export` for bulk export / spreadsheet use.
- No default time window and no `--page`/`--page-size` (unlike `defi`) — pass `--from-time`/`--to-time` to bound a high-activity token instead of relying on the 5000-row cap to truncate cleanly.
