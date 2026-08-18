# Program Reference

```bash
solscan program <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|----------|
| `list` | Programs active in the last 90 days | — | `--page`, `--page-size`, `--sort-by`, `--sort-order` |
| `popular` | Most-used DeFi programs/platforms | — | — |
| `analytics` | On-chain analytics for a program | `--address`, `--range` | — |

## Option details

**`list`**: `--sort-by` `num_txs`(default)\|`num_txs_success`\|`interaction_volume`\|`success_rate`\|`active_users_24h` · `--page-size` `10/20/30/40`.

**`analytics`**: `--address` minimum 30 chars, required · `--range` `7`\|`30` days, required.

## Examples

```bash
solscan program list --sort-by num_txs --sort-order desc
solscan program list --sort-by success_rate --sort-order desc
solscan program popular
solscan program analytics --address TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA --range 7
solscan program analytics --address TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA --range 30
```
