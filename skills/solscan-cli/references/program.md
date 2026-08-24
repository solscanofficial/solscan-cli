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

## Response Fields

Field-by-field description of each action's JSON response (types, meaning, edge cases): [responses/program.md](responses/program.md) (index + shared envelope) → [responses/program-list.md](responses/program-list.md) (`list`) / [responses/program-popular.md](responses/program-popular.md) (`popular`) / [responses/program-analytics.md](responses/program-analytics.md) (`analytics`).

## Examples

```bash
solscan program list --sort-by num_txs --sort-order desc
solscan program list --sort-by success_rate --sort-order desc
solscan program popular
solscan program analytics --address TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA --range 7
solscan program analytics --address TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA --range 30
```
