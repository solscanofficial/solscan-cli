# Block Response Fields — Transactions

Field-by-field description of the JSON the `block transactions` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../block.md](../block.md) for flags/params). Shared envelope/error shape: [block.md](block.md#common-envelope).

This covers **the transactions inside one specific block**, paginated — as opposed to [`block detail`](block-detail.md) (that block's own metadata, no transaction list) or `transaction last` (the network's most recent transactions, not scoped to a block).

## `transactions`

`solscan block transactions --block <slot> [--page 1] [--page-size 10|20|30|40|60|100] [--exclude-vote] [--program <address>]`

`data` is an object with a `total` count plus a `transactions` array — the only paginated block action (`--page`/`--page-size`, default `1`/`10`). `--exclude-vote` drops consensus vote transactions; `--program` filters to transactions that touched a given program address.

| Field | Type | Description |
|-------|------|--------------|
| `total` | number | **The block's raw, unfiltered transaction count** — identical to `transactions_count` from `block detail` for the same slot. For example, passing `--exclude-vote` or `--program` changes which transactions come back in the `transactions` array, but **does not** change `total`. Don't use `total` to compute filtered-result page counts — `ceil(total / page_size)` only holds when no `--exclude-vote`/`--program` filter is applied. |
| `transactions` | array of object | One page of transaction summaries, **after** `--exclude-vote`/`--program` filtering is applied — see below. Can be an empty array `[]` if the filter matches nothing on the requested page. |

## `transactions[]` item fields

Same base shape as [`transaction last`](transaction-last.md#item-fields) — see [transaction-last.md § Item fields](transaction-last.md#item-fields) and [§ parsed_instructions item fields](transaction-last.md#parsed_instructions-item-fields) for `slot`, `fee`, `status`, `signer`, `block_time`, `tx_hash`, `parsed_instructions`, `program_ids`, `time`. Every entry here belongs to the block passed as `--block`, so `slot` is constant across the page.

**Not identical**, however — `block transactions` items carry one extra field that `transaction last` items do **not** (confirmed live on both endpoints):

| Field | Type | Description |
|-------|------|--------------|
| `version` | number \| string | The transaction's version: `"legacy"`, `0`, or `1` (observed live). Present on every `block transactions` item (and on [`account transactions`](account-activity.md#transactions) items too); absent from `transaction last` items — don't assume the shapes are 100% interchangeable. |

`parsed_instructions` can legitimately be `[]` — several real transactions (e.g. simple `system`/vote-adjacent transfers with no decodable top-level instruction) return no entries there while still populating `program_ids`.

## Top-level envelope note

Every observed response (success and this action specifically) also carries a `"metadata": {}` key alongside `success`/`data` — always an empty object in samples taken so far. It's undocumented in Solscan's published reference and not part of [the shared envelope doc](block.md#common-envelope) prior to this note; harmless to ignore, but don't be surprised if it appears in raw JSON output. Error responses (400/401/429/500) do **not** carry `metadata` — see [block.md](block.md#common-envelope).

**Example** (live response, `solscan block transactions --block 447486327 --page-size 3`):

```json
{
  "success": true,
  "data": {
    "total": 1039,
    "transactions": [
      {
        "slot": 447486327,
        "fee": 5000,
        "status": "Success",
        "signer": ["BAMgx3XPWrXkNUuQiVWUZU6eB2HQZdwz9HNnT4tpo8LG"],
        "version": "legacy",
        "block_time": 1789550228,
        "tx_hash": "NeiVgFdfUU2cCAmgV9yeBTzEiYGjFL5qrSYjLkQ9rUA3XX3hi7NDaDjwobPwdmTXz5BJAbyFxeUeLkoSTaw9oB8",
        "parsed_instructions": [
          { "type": "SetComputeUnitLimit", "program": "ComputeBudget", "program_id": "ComputeBudget111111111111111111111111111111" }
        ],
        "program_ids": ["ComputeBudget111111111111111111111111111111", "tickUcsEQegChaAuo9VYQQztB4ZGApY6ZT4FkULWY6N"],
        "time": "2026-09-16T09:17:08.000Z"
      },
      {
        "slot": 447486327,
        "fee": 6133,
        "status": "Success",
        "signer": ["83TSSS7qojPowqrrvH23mCrhEJjnJG2ygaf7FEq9ZgKC"],
        "version": 0,
        "block_time": 1789550228,
        "tx_hash": "3FCiR5wBPMCnqCHLBnfkf4vXLjAzdRhYW5gHhC8qseCAo3yQDWfxLjqXZPe4M93EJVQM3dELpyNEqwCY87i35jE",
        "parsed_instructions": [
          { "type": "setLoadedAccountsDataSizeLimit", "program": "ComputeBudget", "program_id": "ComputeBudget111111111111111111111111111111" }
        ],
        "program_ids": ["ComputeBudget111111111111111111111111111111", "ojh19ojaKduoJZuaJADhcVGp4xt1TcdAvZmpVsCorch"],
        "time": "2026-09-16T09:17:08.000Z"
      },
      {
        "slot": 447486327,
        "fee": 5418,
        "status": "Success",
        "signer": ["Gs7aQqWznF4F2hb26kt3NdMnM3RTnNcgpWMc9NLJaj6y"],
        "version": "legacy",
        "block_time": 1789550228,
        "tx_hash": "C1m9YbtighVcbrMNfYinRVn4j2Me96zxaoiU4FKYEwv4fiPMX2bTtjpdoELFqLq9b8wXW9YP5wnTbUgTvswLK8M",
        "parsed_instructions": [
          { "type": "SetComputeUnitLimit", "program": "ComputeBudget", "program_id": "ComputeBudget111111111111111111111111111111" },
          { "type": "SetComputeUnitPrice", "program": "ComputeBudget", "program_id": "ComputeBudget111111111111111111111111111111" }
        ],
        "program_ids": ["BiSoNHVpsVZW2F7rx2eQ59yQwKxzU5NvBcmKshCSUypi", "ComputeBudget111111111111111111111111111111"],
        "time": "2026-09-16T09:17:08.000Z"
      }
    ]
  },
  "metadata": {}
}
```

## Interpretation tips

- Vote transactions dominate most blocks by count — pass `--exclude-vote` when the user wants "real" activity in a block rather than consensus noise, same rationale as `transaction last`'s `--filter exceptVote` default (note: `block transactions` defaults to **including** votes; you must pass the flag explicitly).
- `total` does **not** shrink when you filter — it always reports the block's full transaction count (equal to `block detail`'s `transactions_count`). To know how many transactions actually match `--exclude-vote`/`--program`, page through `transactions` yourself (or cross-check against `block detail --block <slot>`'s `transactions_count` if you need the unfiltered figure for comparison) rather than trusting `total` as a filtered count.
- `version` lets you tell legacy vs. versioned (v0/v1) transactions apart when scanning a block; the same field also appears on `account transactions` and `transaction detail`/`detail-multi`. `transaction last` is the one exception that doesn't expose it, so don't copy per-item parsing code from `last` without accounting for the missing field.
