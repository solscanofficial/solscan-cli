# Block Reference

```bash
solscan block <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|----------|
| `last` | Latest blocks | — | `--limit` |
| `detail` | Block metadata by slot number | `--block` | — |
| `transactions` | Paginated transactions in a block | `--block` | `--page`, `--page-size`, `--exclude-vote`, `--program` |

## Option details

**`last`**: `--limit` `10/20/30/40/60/100` (default `10`). Response is a flat, unpaginated array of block metadata (hash, fee rewards, tx count, parent) — full field-by-field breakdown: [responses/block-last.md](responses/block-last.md).

**`detail`**: `--block <slot>` is the slot index (minimum `0`), required. Response is a single block's metadata — full field-by-field breakdown: [responses/block-detail.md](responses/block-detail.md).

**`transactions`**: `--page-size` `10/20/30/40/60/100` · `--exclude-vote` boolean flag (default includes votes) · `--program` single program address filter. Response is `{ total, transactions[] }`, paginated via `--page`/`--page-size`; each transaction item reuses `transaction last`'s shape — full field-by-field breakdown: [responses/block-transactions.md](responses/block-transactions.md).

## Response Fields

Field-by-field description of each action's JSON response (types, meaning, edge cases): [responses/block.md](responses/block.md) (index + shared envelope) → [responses/block-detail.md](responses/block-detail.md) (`detail`) / [responses/block-last.md](responses/block-last.md) (`last`) / [responses/block-transactions.md](responses/block-transactions.md) (`transactions`).

## Examples

```bash
solscan block last --limit 20
solscan block detail --block 250000000
solscan block transactions --block 250000000 --exclude-vote --page-size 40
solscan block transactions --block 250000000 --program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
```
