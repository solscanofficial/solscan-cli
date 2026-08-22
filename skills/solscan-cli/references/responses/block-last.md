# Block Response Fields — Last

Field-by-field description of the JSON the `block last` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../block.md](../block.md) for flags/params). Shared envelope/error shape: [block.md](block.md#common-envelope).

This covers **the most recent blocks network-wide** — the same per-block metadata as [`block detail`](block-detail.md), returned as a flat, unpaginated array instead of a single object.

## `last`

`solscan block last [--limit 10|20|30|40|60|100]`

`data` is a **flat array** of block metadata objects, most recent first. No pagination — `--limit` (default `10`) directly caps the array length.

## Item fields

| Field | Type | Description |
|-------|------|--------------|
| `current_slot` | number | This block's own slot index — unlike `block detail`, `last` does include this, since there's no `--block` in the request to imply it. |
| `fee_rewards` | number | Total fee rewards collected in this block, in **lamports**. |
| `transactions_count` | number | Number of transactions included in this block. |
| `block_height` | number | The number of blocks beneath this one. |
| `block_time` | number | Unix timestamp (seconds) the block was produced. Same instant as `time`, different encoding. |
| `time` | string | ISO 8601 timestamp of the block. |
| `blockhash` | string | This block's own hash — same field name as `detail`'s `blockhash` (no underscore). |
| `parent_slot` | number | The slot index of this block's parent. |
| `previous_block_hash` | string | The blockhash of this block's parent — feed into `--block` for the previous block's `detail`/`transactions`. |

**Example** (from [Solscan's published reference](https://pro-api.solscan.io/v2.0/block/last)):

```json
{
  "success": true,
  "data": [
    {
      "fee_rewards": 6119798,
      "transactions_count": 1565,
      "current_slot": 282507761,
      "block_height": 261598527,
      "block_time": 1723200048,
      "time": "2024-08-09T10:40:48.000Z",
      "blockhash": "E93xB3KesRfAsrB8XZHGaiZZDEREpNHf9pmsNhqSdwd6",
      "parent_slot": 282507760,
      "previous_block_hash": "2DQuwVxXsPhbEKhF45GSnKuTF7Nwy14DWYtGuQBf8fZR"
    }
  ]
}
```

## Interpretation tips

- There's no cursor, `total`, or next-page token — `last` is a "most recent N" snapshot (max `--limit 100`), not built for backfill. To page further back, take the oldest row's `previous_block_hash` (or `current_slot - 1`) and call `block detail --block <slot>` repeatedly, or `block transactions` if you want a given block's transactions rather than more block headers.
- `fee_rewards` is in lamports (divide by `1e9` for SOL). `block_time`/`time` describe the same instant in two formats — don't treat them as independent data points.
