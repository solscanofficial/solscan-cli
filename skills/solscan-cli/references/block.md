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

**`last`**: `--limit` `10/20/30/40/60/100` (default `10`).

**`detail`**: `--block <slot>` is the slot index (minimum `0`), required.

**`transactions`**: `--page-size` `10/20/30/40/60/100` · `--exclude-vote` boolean flag · `--program` single program address filter.

## Examples

```bash
solscan block last --limit 20
solscan block detail --block 250000000
solscan block transactions --block 250000000 --exclude-vote --page-size 40
solscan block transactions --block 250000000 --program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
```
