# Market Reference

```bash
solscan market <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|----------|
| `list` | All trading pools/markets | — | `--page`, `--page-size`, `--program`, `--token-address`, `--sort-by`, `--sort-order` |
| `info` | Pool/market details by address | `--address` | — |
| `volume` | Historical volume data | `--address` | `--time` |
| `positions` | Market positions (CLMM-style) | `--address` | `--page`, `--page-size`, `--sort-by`, `--sort-order`, `--in-range` |

## Option details

**`list`**: `--sort-by` `created_time`\|`volumes_24h`(default)\|`trades_24h` · `--page-size` `10/20/30/40/60/100`.

**`info`**: `--address` minimum 30 chars, required.

**`volume`**: `--time <start>,<end>` — single comma-separated value in `YYYYMMDD` format.

**`positions`**: `--sort-by` `position_value`(default)\|`created_time` · `--page-size` `10/20/30/40` · `--in-range` filters to in-range (or out-of-range) positions only.

## Examples

```bash
solscan market list --sort-by volumes_24h --sort-order desc
solscan market list --token-address EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

solscan market info --address 8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh
solscan market volume --address 8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh --time 20240701,20240715

solscan market positions --address 939z7rR7etdm9W6rC2MHcrHXWEA3jJxMwDLzfD1qSvju --sort-by position_value --sort-order desc
solscan market positions --address 939z7rR7etdm9W6rC2MHcrHXWEA3jJxMwDLzfD1qSvju --in-range --page-size 20
```
