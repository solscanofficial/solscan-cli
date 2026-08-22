# Block Response Fields — Detail

Field-by-field description of the JSON the `block detail` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../block.md](../block.md) for flags/params). Shared envelope/error shape: [block.md](block.md#common-envelope).

This covers **a single block's metadata** — hash, fee rewards, transaction count, parent linkage — not the block's transactions themselves (use [`block transactions`](block-transactions.md) for that).

## `detail`

`solscan block detail --block <slot>`

`data` is a **single flat object** describing the requested block. `--block` is the slot index (required, minimum `0`).

## Fields

| Field | Type | Description |
|-------|------|--------------|
| `blockhash` | string | This block's own hash. |
| `fee_rewards` | number | Total fee rewards collected in this block, in **lamports**. |
| `transactions_count` | number | Number of transactions included in this block. |
| `block_height` | number | The number of blocks beneath this one — Solana's canonical block-height counter (distinct from `slot`, which counts leader slots and can skip). |
| `block_time` | number | Unix timestamp (seconds) the block was produced. Same instant as `time`, different encoding. |
| `time` | string | ISO 8601 timestamp of the block (e.g. `"2024-08-06T04:57:14.000Z"`) — same instant as `block_time`, formatted for display rather than arithmetic. |
| `parent_slot` | number | The slot index of this block's parent. |
| `previous_block_hash` | string | The blockhash of this block's parent — pass this as `--block`/lookup key to walk backward through the chain one block at a time. |

**Example** (from [Solscan's published reference](https://pro-api.solscan.io/v2.0/block/detail)):

```json
{
  "success": true,
  "data": {
    "blockhash": "8Gsd6Bky9RJAUKNRae5mrbzQkPPbeMHUXFnxJ5jEnsXQ",
    "fee_rewards": 19674247,
    "transactions_count": 1513,
    "block_height": 260946879,
    "block_time": 1722920234,
    "time": "2024-08-06T04:57:14.000Z",
    "parent_slot": 281844069,
    "previous_block_hash": "G9Cnb8CguMEcKSZQuUvRc2DP1gGTvTjWE3XaqCpAGZd5"
  }
}
```

## Interpretation tips

- There is no `current_slot`/`slot` field identifying *this* block's own slot index in the response — the request already pinned it via `--block`, so echo the `--block` value back yourself if you need it alongside these fields (e.g. in a table).
- `fee_rewards` is in lamports (divide by `1e9` for SOL), matching Solana RPC convention — same convention as `transaction last`'s `fee` field.
- `block_height` and `parent_slot`/the block's own slot are different counters: `block_height` never skips, while slot numbers can (skipped leader slots don't produce a block but still consume a slot number). Don't assume `block_height` values are 1 apart just because slot numbers are.
