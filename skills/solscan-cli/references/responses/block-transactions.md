# Block Response Fields — Transactions

Field-by-field description of the JSON the `block transactions` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../block.md](../block.md) for flags/params). Shared envelope/error shape: [block.md](block.md#common-envelope).

This covers **the transactions inside one specific block**, paginated — as opposed to [`block detail`](block-detail.md) (that block's own metadata, no transaction list) or `transaction last` (the network's most recent transactions, not scoped to a block).

## `transactions`

`solscan block transactions --block <slot> [--page 1] [--page-size 10|20|30|40|60|100] [--exclude-vote] [--program <address>]`

`data` is an object with a `total` count plus a `transactions` array — the only paginated block action (`--page`/`--page-size`, default `1`/`10`). `--exclude-vote` drops consensus vote transactions; `--program` filters to transactions that touched a given program address.

| Field | Type | Description |
|-------|------|--------------|
| `total` | number | Total transaction count in the block **matching the applied filters** (`--exclude-vote`/`--program`), not necessarily the block's raw `transactions_count` from `block detail` — use `total` to compute total pages (`ceil(total / page_size)`), not the unfiltered block metadata. |
| `transactions` | array of object | One page of transaction summaries — same per-item shape as [`transaction last`](transaction-last.md#item-fields), see below. |

## `transactions[]` item fields

Identical shape to `transaction last`'s items — see [transaction-last.md § Item fields](transaction-last.md#item-fields) and [§ parsed_instructions item fields](transaction-last.md#parsed_instructions-item-fields) for the full breakdown (`slot`, `fee`, `status`, `signer`, `block_time`, `tx_hash`, `parsed_instructions`, `program_ids`, `time`). Every entry here belongs to the block passed as `--block`, so `slot` is constant across the page.

**Example** (from [Solscan's published reference](https://pro-api.solscan.io/v2.0/block/transactions)):

```json
{
  "success": true,
  "data": {
    "total": 1513,
    "transactions": [
      {
        "slot": 281844070,
        "fee": 5000,
        "status": "Success",
        "signer": ["GHscu7RUsYh2ChbdrW2wFyFpHKrtkuPYZB2XbBRxMjCW"],
        "block_time": 1722920234,
        "tx_hash": "4dqr5SruMWyv6z31Xp2DCmeyEGwaewvqCe8shfxKXRhUqaF8naGq7TTyVafHz7WDABM5ZAvhsh3GJAwc9JNySGrG",
        "parsed_instructions": [
          { "type": "compactupdatevotestate", "program": "vote", "program_id": "Vote111111111111111111111111111111111111111" }
        ],
        "program_ids": ["Vote111111111111111111111111111111111111111"],
        "time": "2024-08-06T04:57:14.000Z"
      }
    ]
  }
}
```

## Interpretation tips

- Vote transactions dominate most blocks by count — pass `--exclude-vote` when the user wants "real" activity in a block rather than consensus noise, same rationale as `transaction last`'s `--filter exceptVote` default (note: `block transactions` defaults to **including** votes; you must pass the flag explicitly).
- `--program` filters server-side to transactions that touched that program address — cheaper than fetching every transaction in the block and filtering `program_ids` client-side yourself.
- `fee` is in lamports, matching Solana RPC convention (same as `transaction last`).
- Follow up on any `tx_hash` with `transaction detail --signature <tx_hash>` (raw balance-change/instruction view) or `transaction actions --signature <tx_hash>` (decoded human-readable summary) once you've picked a transaction of interest.
