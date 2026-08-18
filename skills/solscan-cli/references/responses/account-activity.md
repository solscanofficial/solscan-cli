# Account Response Fields — Transaction & Transfer History

Field-by-field description of the JSON these `account <action>` commands return. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../account.md](../account.md) for flags/params). Shared envelope/error shape: [account.md](account.md#common-envelope).

These actions all return **time-ordered activity** for an address — transactions, transfers, DeFi actions, balance changes — as opposed to a snapshot of current state. For "what does this address currently hold" see [account-info.md](account-info.md) (raw token accounts) and [account-holdings.md](account-holdings.md) (priced portfolio/stake).

## Contents

- [`transactions`](#transactions)
- [`transactions-enhanced`](#transactions-enhanced)
- [`transfers`](#transfers)
- [`transfer-total`](#transfer-total)
- [`defi`](#defi)
- [`balance-change`](#balance-change)

> Only actions with a confirmed field-level source are documented here. If the action you need isn't listed yet, fall back to the `--no-json` output or `--help`, and treat unlabeled fields at face value rather than guessing their meaning.

## `transactions`

`solscan account transactions --address <ADDRESS> [--before <signature>] [--limit <10|20|30|40>]`

`data` is an **array** — one object per transaction the address signed or was involved in, newest first. There's no `total`/`has_next` metadata: to page further back, take the `tx_hash` of the last (oldest) row in the current page and pass it as `--before` on the next call; stop once a page comes back with fewer than `--limit` rows.

Each item in `data`:

| Field | Type | Description |
|-------|------|--------------|
| `slot` | number | Slot number the transaction landed in. |
| `fee` | number | Transaction fee paid, in lamports. |
| `status` | string | `Success` or `Fail`. A failed transaction still consumed the fee and landed on-chain — it's not the same as "never happened." |
| `signer` | array of string | Address(es) that signed the transaction. Usually one entry, but multisig-style transactions can have several. |
| `block_time` | number | Unix timestamp (seconds) of the slot. |
| `tx_hash` | string | The transaction signature — feed into `transaction detail`/`transaction actions` for full instruction-level detail, or into this command's own `--before` for pagination. |
| `parsed_instructions` | array of object | Human-readable summary of each instruction in the transaction, in execution order. Each entry has `type` (instruction name, e.g. `"cancelAllAndPlaceOrders"`), `program` (program's known name, e.g. `"openbook_v2"`), and `program_id` (the program's address). |
| `program_ids` | array of string | Every program address touched by the transaction (including system/compute-budget programs), deduplicated — a superset of the addresses in `parsed_instructions`. |
| `time` | string | Same instant as `block_time`, as an ISO-8601 string. |

**Example**

```json
{
  "success": true,
  "data": [
    {
      "slot": 282450328,
      "fee": 60601,
      "status": "Fail",
      "signer": ["ob2htHLoCu2P6tX7RrNVtiG1mYTas8NGJEVLaFEUngk"],
      "block_time": 1723176170,
      "tx_hash": "2k5SKZo9tAgK3w24EozcCSm1doWLmqoFTe8UeSHd2pp7KJbsH4pRdM78hwfDsSTEC7edJtNYAEGryZe5L1uxU5DU",
      "parsed_instructions": [
        { "type": "cancelAllAndPlaceOrders", "program": "openbook_v2", "program_id": "opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb" },
        { "type": "settleFunds", "program": "openbook_v2", "program_id": "opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb" }
      ],
      "program_ids": [
        "ComputeBudget111111111111111111111111111111",
        "GDDMwNyyx8uB6zrqwBFHjLLG3TBYk2F8Az4yrQC5RzMp",
        "opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb"
      ],
      "time": "2024-08-09T04:02:50.000Z"
    }
  ]
}
```

**Interpretation tips**

- Always check `status` before summarizing a transaction's effect — a `Fail` row still shows up here (and still cost `fee`), but none of its intended token/balance movements actually happened on-chain. Cross-check with `account transfers`/`balance-change` if you need to confirm whether funds actually moved.
- This is a **lightweight, cursor-paginated overview** (`before`/`limit` only, `limit` capped at 10/20/30/40) — for server-side filtering by time/slot/program/token/signer/instruction, or for raw `getTransaction`-shaped output, use `transactions-enhanced` instead.
- `parsed_instructions` is a summary, not the full instruction (no accounts/data/args) — pass `tx_hash` to `transaction detail` or `transaction actions` when you need arguments, account lists, or token/SOL amounts moved.
- `program_ids` is a flat, deduplicated list — use it for a quick "did this transaction touch program X" check without walking `parsed_instructions`.
- To paginate backward in time, set `--before` to the `tx_hash` of the **last** item in the current page (the oldest one, since results are newest-first), not the first.

## `transactions-enhanced`

`solscan account transactions-enhanced --address <ADDRESS> [filters...]`

Unlike [`transactions`](#transactions), `data` here is an array of **raw Solana transaction objects** — the same shape the `getTransaction` RPC method returns, not a Solscan-flattened summary. There's no `total`/`has_next` metadata; page further back by taking the last row's signature (`transaction.signatures[0]`) and passing it as `--to-signature` (or track slot/time and use `--to-slot`/`--to-time`), or use `--cursor` from a prior response if one was returned.

**Example**

```json
{
  "success": true,
  "data": [
    {
      "slot": 421152023,
      "transaction": {
        "signatures": ["4TbGgtWnDSBnN4Jk5Doypgwu7NHzG31eZk4D8qtPPBk3SoCP6SLujxfAzpAaDgrdPwH9iSS2feq5CzgibsSR4ivm"],
        "message": {
          "accountKeys": [
            { "pubkey": "5M63GXr6W8P5vHLzdJhvsoZuQ5dqJ7mr93HT7tiXiJcu", "writable": true, "signer": true, "source": "transaction" },
            { "pubkey": "fastC7gqs2WUXgcyNna2BZAe9mte4zcTGprv3mv18N3", "writable": false, "signer": false, "source": "transaction" }
          ],
          "recentBlockhash": "88KfrNkzBkJBHpTbnHx6mHMxrTvkbn5911SKT4u19xRP",
          "instructions": [
            {
              "programId": "fastC7gqs2WUXgcyNna2BZAe9mte4zcTGprv3mv18N3",
              "accounts": ["5M63GXr6W8P5vHLzdJhvsoZuQ5dqJ7mr93HT7tiXiJcu"],
              "data": "27BPbY9Z6mZ1xrHKjrbQ9BupQh632xXkJgTKchNMi65WHsNktVQo74K",
              "stackHeight": 1
            }
          ],
          "addressTableLookups": []
        }
      },
      "meta": {
        "err": null,
        "status": { "Ok": null },
        "fee": 8500,
        "preBalances": [1033813651, 1141441],
        "postBalances": [1033805151, 1141441],
        "innerInstructions": [],
        "logMessages": [
          "Program fastC7gqs2WUXgcyNna2BZAe9mte4zcTGprv3mv18N3 invoke [1]",
          "Program fastC7gqs2WUXgcyNna2BZAe9mte4zcTGprv3mv18N3 success"
        ],
        "preTokenBalances": [],
        "postTokenBalances": [],
        "rewards": [],
        "computeUnitsConsumed": 516,
        "costUnits": 2490
      },
      "version": 0,
      "blockTime": 1779346531
    }
  ]
}
```

**Interpretation tips**

- This is the "raw" counterpart to [`transactions`](#transactions) — reach for it when you need account-level detail (writable/signer flags, per-instruction accounts/data, inner CPI instructions, token balance deltas) that the plain `transactions` summary doesn't expose, or when you need to filter server-side by slot/time/program/token/signer/instruction rather than just cursoring through everything.
- `--encoding jsonParsed` (the default) parses recognized programs' `instructions[].data` into named fields; unrecognized programs, or other `--encoding` values, leave `data` as an opaque encoded string — don't assume every instruction is human-readable.
- Cross-reference `transaction.message.accountKeys[n]` with the numeric indices used elsewhere (`preBalances`/`postBalances`, and `accounts` arrays inside instructions when not resolved to pubkeys) — they share the same ordering.
- `meta.innerInstructions` is where most CPI activity actually shows up (e.g. a DEX swap's underlying token transfers) — the top-level `transaction.message.instructions` alone often only shows the outer "swap" call.
- For amount-moved / who-sent-what questions, `meta.preTokenBalances`/`postTokenBalances` (SPL) and `meta.preBalances`/`postBalances` (SOL) are more reliable than trying to parse `logMessages`. For a friendlier pre-summarized version of the same transaction, use `transaction detail` or `transaction actions` instead.
- `--instruction` filtering matches on program address + discriminator, so it's precise (a specific instruction on a specific program) but requires knowing the discriminator hex up front — computing it typically means checking the program's IDL rather than guessing.

## `transfers`

`solscan account transfers --address <ADDRESS> [filters...]`

Unlike `detail`/`data-decoded`, `data` here is an **array** — one object per transfer activity, ordered by `--sort-by` (default `block_time`) / `--sort-order` (default `desc`, so newest first). There's no separate pagination metadata (no `total`/`has_next`) — page by incrementing `--page` until a response comes back with fewer than `--page-size` rows.

Each item in `data`:

| Field | Type | Description |
|-------|------|--------------|
| `block_id` | number | Slot number the transfer's transaction landed in. |
| `trans_id` | string | Transaction signature — feed into `transaction detail`/`transaction actions` for the full transaction. |
| `block_time` | number | Unix timestamp (seconds) of the slot. |
| `time` | string | Same instant as `block_time`, as an ISO-8601 string. |
| `activity_type` | string | One of the `ACTIVITY_SPL_*` enum values (full list in [../account.md](../account.md)) — the specific kind of transfer (plain transfer, burn, mint, stake move, etc.), more granular than `flow`. |
| `from_address` | string | Source wallet/owner address. |
| `from_token_account` | string | Source's associated token account address — present for SPL transfers where the token account differs from the owner wallet; typically absent for native SOL moves. |
| `to_address` | string | Destination wallet/owner address. |
| `to_token_account` | string | Destination's associated token account address, same caveat as `from_token_account`. |
| `token_address` | string | Mint address of the transferred token (native SOL shows as the wrapped-SOL mint `So11111111111111111111111111111111111111112`). |
| `token_decimals` | number | Decimals for `token_address` — divide `amount` by `10^token_decimals` for the human-readable amount. |
| `amount` | number | Raw transfer amount in the token's base units (not yet decimal-adjusted). |
| `flow` | string | `in` or `out`, **relative to the `--address` you queried** — which side of this transfer that specific wallet was on. |

**Example**

```json
{
  "success": true,
  "data": [
    {
      "block_id": 275794898,
      "trans_id": "4AU5ShM99Db1yXr72jukaUNSJTnJtp76zt6CdL9ghatA3N4HYU9jaHre2HsHqWcKipKCD3MenvdShPsRrAU6CC4f",
      "block_time": 1720171655,
      "time": "2024-07-05T09:27:35.000Z",
      "activity_type": "ACTIVITY_SPL_TRANSFER",
      "from_address": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
      "to_address": "6U91aKa8pmMxkJwBCfPTmUEfZi6dHe7DcFq2ALvB2tbB",
      "token_address": "So11111111111111111111111111111111111111112",
      "token_decimals": 9,
      "amount": 1587870559,
      "flow": "in"
    }
  ]
}
```

**Interpretation tips**

- Always divide `amount` by `10 ** token_decimals` before displaying — a raw `amount` of `1587870559` with `token_decimals: 9` is `1.587870559` SOL, not ~1.59 billion.
- `flow` is relative, not absolute: it tells you whether the queried `--address` was the sender or receiver in *this* transfer, not which of `from_address`/`to_address` is "the wallet." Don't assume `to_address` always equals the queried address just because `flow` is `in`.
- `activity_type` carries more nuance than `flow` — an `out` entry could be a plain `ACTIVITY_SPL_TRANSFER`, a burn, or several other activity kinds. Check it before describing a row as "sent to someone."
- This endpoint returns no total/count metadata. Use `transfer-total` (same filters, no pagination) when you need a count without paging through every row, or `transfer-export` when you need the full dataset as CSV.

## `transfer-total`

`solscan account transfer-total --address <ADDRESS> [filters...]`

This is the odd one out in the `account` group: unlike every other action, `data` here is a **bare number**, not an object or array — the total count of transfer activities matching the given filters. There is no pagination, no per-row detail, and no `metadata` beyond an empty object.

| Field | Type | Description |
|-------|------|--------------|
| `data` | number | Total count of transfer activities matching the filters — a count, not a list of transfers. |

**Example**

```json
{
  "success": true,
  "data": 1554,
  "metadata": {}
}
```

**Interpretation tips**

- Same filter set as [`transfers`](#transfers) (`--activity-type`, `--from`/`--to`/`--exclude-from`/`--exclude-to`, `--token`, `--amount`, `--value`, `--from-time`/`--to-time`, `--exclude-amount-zero`, `--flow`) minus anything pagination- or sort-related (`--page`, `--page-size`, `--sort-by`, `--sort-order` don't apply — there's nothing to page or sort). Reuse the same filter values as a `transfers` call to get "how many rows would that query return" without paging through them.
- **Defaults to the last ~3 weeks** if neither `--from-time` nor `--to-time` is given — this is a narrower window than it looks, so a "total transfers" question with no time filter answers "in the last 3 weeks," not "ever." Pass explicit `--from-time`/`--to-time` (or a wide range) when the user wants a lifetime or custom-period total.
- **Hard-capped at 10,000,000** — if a whale/exchange/program address is anywhere near that count, the returned number may be truncated rather than exact. Tighten `--from-time`/`--to-time` or other filters and re-check if the count looks suspiciously round or you suspect truncation.
- Cheap way to decide whether `transfers` (paginated detail) or `transfer-export` (CSV, capped at 5000 rows) is the right next call: if `transfer-total` is small, `transfers`/`transfer-export` can realistically return everything; if it's huge, narrow the filters first rather than paging or exporting blindly.

## `defi`

`solscan account defi --address <ADDRESS> [filters...]`

Like [`transfers`](#transfers), `data` is an **array** — one object per DeFi activity, ordered by `--sort-by` (default and currently only `block_time`) / `--sort-order` (default `desc`, newest first). No `total`/`has_next` metadata — page by incrementing `--page` until a response comes back with fewer than `--page-size` rows.

Each item in `data`:

| Field | Type | Description |
|-------|------|--------------|
| `block_id` | number | Slot number the activity's transaction landed in. |
| `trans_id` | string | Transaction signature — feed into `transaction detail`/`transaction actions` for the full transaction. |
| `block_time` | number | Unix timestamp (seconds) of the slot. |
| `time` | string | Same instant as `block_time`, as an ISO-8601 string. |
| `activity_type` | string | One of the `ACTIVITY_*` DeFi enum values (full list in [../account.md](../account.md)) — swap, liquidity, staking, borrowing, bridge, etc. |
| `from_address` | string | The wallet/account address that initiated the activity. |
| `to_address` | string | Counterparty address for the activity — e.g. the aggregator/router program for `ACTIVITY_AGG_TOKEN_SWAP`. |
| `sources` | array of string | Program address(es) of the underlying pool(s)/venue(s) the activity routed through. |
| `platform` | string | Address of the top-level protocol/aggregator that the activity is attributed to (e.g. an aggregator's router program). |
| `amount_info` | object | The swap/transfer amounts for this activity — see below. Shape varies by `activity_type`; fields not relevant to a given activity (e.g. no second leg for a single-sided stake/borrow action) may be absent. |

**`amount_info`** fields:

| Field | Type | Description |
|-------|------|--------------|
| `token1` | string | Mint address of the first token in the activity (e.g. the token sold in a swap). |
| `token1_decimals` | number | Decimals for `token1` — divide `amount1` by `10^token1_decimals` for the human-readable amount. |
| `amount1` | number | Raw amount of `token1` in base units. |
| `token2` | string | Mint address of the second token (e.g. the token bought in a swap). Absent for activities with no second leg. |
| `token2_decimals` | number | Decimals for `token2`. |
| `amount2` | number | Raw amount of `token2` in base units. |
| `routers` | array of object | The swap path — one entry per pool hop. Same `token1`/`token1_decimals`/`amount1`/`token2`/`token2_decimals`/`amount2` shape as `amount_info` itself, but with amounts as **strings**, plus an optional `child_routers` array of the same shape for aggregator swaps (`ACTIVITY_AGG_TOKEN_SWAP`) that split one trade across multiple underlying pools. |

**Example** (`ACTIVITY_AGG_TOKEN_SWAP` — an aggregator-routed swap; other `activity_type` values populate `amount_info` more sparsely, see tips below)

```json
{
  "success": true,
  "data": [
    {
      "block_id": 275994804,
      "trans_id": "sgccc7AnmQ7mUxk7JPVZWSqD18Dm4eaMv61jte9sWjBakck5QK3UFSLnxMAqwiTUHjF8BXvaHaLAWnzGPRi77Cr",
      "block_time": 1720263055,
      "time": "2024-07-06T10:50:55.000Z",
      "activity_type": "ACTIVITY_AGG_TOKEN_SWAP",
      "from_address": "ob2htHLoCu2P6tX7RrNVtiG1mYTas8NGJEVLaFEUngk",
      "to_address": "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
      "sources": ["CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK"],
      "platform": "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
      "amount_info": {
        "token1": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "token1_decimals": 6,
        "amount1": 1000000,
        "token2": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
        "token2_decimals": 6,
        "amount2": 503392,
        "routers": [
          {
            "token1": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            "token1_decimals": 6,
            "amount1": "1000000",
            "token2": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
            "token2_decimals": 6,
            "amount2": "503392"
          }
        ]
      }
    }
  ]
}
```

**Interpretation tips**

- Always divide `amount1`/`amount2` (and `routers[].amount1`/`amount2`) by `10 ** token*_decimals` before displaying — these are raw base-unit amounts, not human-readable ones.
- `routers[].amount1`/`amount2` come back as **strings** while the top-level `amount_info.amount1`/`amount2` are **numbers** — normalize both through a bignum-safe parse rather than assuming one JS type throughout the payload.
- A single trade routed through an aggregator can fan out into several `routers` entries (one pool hop each), and each of those can further fan out into `child_routers` when the aggregator splits size across parallel pools for the same hop — sum `child_routers` amounts to reconcile against their parent router's `amount1`/`amount2`.
- Not every `activity_type` populates every `amount_info` field — a single-sided action like `ACTIVITY_SPL_TOKEN_STAKE`, `ACTIVITY_BORROWING`, or `ACTIVITY_TOKEN_DEPOSIT_VAULT` may only have a `token1`/`amount1` leg, with `token2`/`amount2`/`routers` absent rather than an error.
- `sources` (the pool/venue program(s) touched) and `platform` (the top-level protocol/aggregator attributed for the activity) are different axes — for a direct DEX swap they're often the same address; for an aggregated swap `platform` is the aggregator (e.g. Jupiter) while `sources` lists the underlying pool(s) it routed through.
- This endpoint has no total/count metadata and no CSV export equivalent documented here beyond `defi-export` (same filters, adds `--platform`, CSV output, rate-limited).

## `balance-change`

`solscan account balance-change --address <ADDRESS> [filters...]`

Like [`transfers`](#transfers) and [`defi`](#defi), `data` is an **array** — one object per balance-changing transaction instruction, ordered by `--sort-by` (default and currently only `block_time`) / `--sort-order` (default `desc`, newest first). No `total`/`has_next` metadata — page by incrementing `--page` until a response comes back with fewer than `--page-size` rows.

Each item in `data`:

| Field | Type | Description |
|-------|------|--------------|
| `block_id` | number | Slot number the transaction landed in. |
| `block_time` | number | Unix timestamp (seconds) of the slot. |
| `time` | string | Same instant as `block_time`, as an ISO-8601 string. |
| `trans_id` | string | Transaction signature — feed into `transaction detail`/`transaction actions` for the full transaction. |
| `address` | string | The wallet address whose balance changed — normally the queried `--address`, but can differ when `--token-account` filters to a token account owned by a different wallet. |
| `token_address` | string | Mint address of the token whose balance changed (native SOL shows as the wrapped-SOL mint `So11111111111111111111111111111111111111112`). |
| `token_account` | string | The specific token account (ATA) whose balance changed. |
| `token_decimals` | number | Decimals for `token_address` — divide `amount`/`pre_balance`/`post_balance` by `10^token_decimals` for human-readable values. |
| `amount` | number | The size of the balance change, in the token's base units (always positive — direction is carried by `change_type`, not the sign of `amount`). |
| `pre_balance` | number | `token_account`'s balance immediately before this change, in base units. |
| `post_balance` | number | `token_account`'s balance immediately after this change, in base units. |
| `change_type` | string | `inc` (balance increased) or `dec` (balance decreased). |
| `fee` | number | Transaction fee paid, in lamports. Reflects the whole transaction's fee, not a per-instruction cost — if a transaction contains multiple balance-changing instructions for the same address, expect the same `fee` value repeated across those rows. |

**Example**

```json
{
  "success": true,
  "data": [
    {
      "block_id": 245299423,
      "block_time": 1706718634,
      "time": "2024-01-31T16:30:34.000Z",
      "trans_id": "2njDKnCCqM9XEsN3TxqbQdPMg6sTSijevfoinsSMg1hZMhn2ubFCtHRR6ux9huLKd7hAPMxCGKJqZ2wcNveoQyDS",
      "address": "9KR7WY8ebL5jD99tmzi3RFmk4v4ahwwHQKdqpG47Vsrg",
      "token_address": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
      "token_account": "FSmkHGcjmGuQaB2aKBqnsg35aajitvqjDWiJi9PdFpxB",
      "token_decimals": 6,
      "amount": 200000000,
      "pre_balance": 0,
      "post_balance": 200000000,
      "change_type": "inc",
      "fee": 1005000
    }
  ]
}
```

**Interpretation tips**

- Always divide `amount`/`pre_balance`/`post_balance` by `10 ** token_decimals` before displaying — the example row is `+200` JUP (`200000000 / 10^6`), not 200 million.
- `post_balance - pre_balance` should equal `amount` in the direction given by `change_type` (`inc`: `post_balance = pre_balance + amount`; `dec`: `post_balance = pre_balance - amount`) — use this to sanity-check a row rather than trusting the sign of `amount` alone, since `amount` itself is unsigned.
- Unlike `transfers`, this is a **balance ledger**, not a counterparty ledger: there's no `from_address`/`to_address`/`flow`-partner here, just "this token account's balance moved by this much." Use `transfers` instead when the user wants to know who sent/received funds, and `balance-change` when they want a per-account balance history/audit trail (e.g. reconciling `pre_balance`/`post_balance` over time).
- `--remove-spam` is worth defaulting to `on` for wallet-summary use cases — spam/dust tokens can otherwise dominate the page with near-zero `amount` rows.
- `fee` is a property of the whole transaction, not of this specific balance change — don't sum `fee` across multiple rows from the same `trans_id` to estimate total fees paid, that double-counts.
