# Transaction Reference

```bash
solscan transaction <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|----------|
| `detail` | Full tx details: balance changes, IDL data, DeFi/transfer activity per instruction | `--signature` | — |
| `detail-multi` | Batch detail (max 50) | `--signatures` | — |
| `actions` | Human-readable decoded actions (transfers, swaps, NFT activity) | `--signature` | — |
| `actions-multi` | Batch decoded actions (max 50) | `--signatures` | — |
| `last` | Most recent transactions | — | `--limit`, `--filter` |
| `fees` | Network fee statistics | — | — |

## Option details

**`detail`/`actions`**: `--signature` length 30–100 chars, required.

**`detail-multi`/`actions-multi`**: `--signatures` comma-separated, max 50, each 30–100 chars.

**`last`**: `--limit` `10/20/30/40/60/100` (default `10`) · `--filter` `exceptVote`(default)\|`all` controls whether consensus vote transactions are included. Response is a flat, unpaginated array of transaction summaries (slot/fee/status/signer/instructions), not full detail — full field-by-field breakdown: [responses/transaction-last.md](responses/transaction-last.md).

Use `actions`/`actions-multi` when the user wants "what happened in this tx" — it's already decoded into human terms. Use `detail`/`detail-multi` when you need raw balance-change/instruction-level data.

## Response Fields

Field-by-field description of each action's JSON response (types, meaning, edge cases): [responses/transaction.md](responses/transaction.md) (index + shared envelope) → [responses/transaction-last.md](responses/transaction-last.md) (`last`).

## Examples

```bash
solscan transaction last
solscan transaction last --limit 20 --filter all

solscan transaction detail --signature 5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQU
solscan transaction actions --signature 5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQU

solscan transaction detail-multi --signatures sig1,sig2,sig3
solscan transaction actions-multi --signatures sig1,sig2,sig3

solscan transaction fees
```
