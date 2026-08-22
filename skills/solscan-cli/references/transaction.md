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

**`detail`/`actions`**: `--signature` length 30–100 chars, required. `detail`'s response is the full parsed shape — SOL/SPL balance changes, per-instruction breakdown (including nested CPI instructions), decoded activities/transfers, raw IDL args — full field-by-field breakdown: [responses/transaction-detail.md](responses/transaction-detail.md) (outer shape) + [responses/transaction-instructions.md](responses/transaction-instructions.md) (`parsed_instructions` tree). `actions`' response is the smaller, pre-decoded "what happened" view (`one_line_summary`, grouped `summaries`, flat `transfers`/`activities`) — full field-by-field breakdown: [responses/transaction-actions.md](responses/transaction-actions.md).

**`detail-multi`/`actions-multi`**: `--signatures` comma-separated, max 50, each 30–100 chars. `detail-multi`'s `data` is an array of the exact same per-transaction shape as `detail`, one entry per signature in request order — see [responses/transaction-detail.md](responses/transaction-detail.md#detail-multi). `actions-multi`'s `data` is likewise an array in request order of the same shape as `actions`, but `metadata.tokens` is a single map shared across the whole batch, not one per transaction — see [responses/transaction-actions.md](responses/transaction-actions.md#actions-multi).

**`last`**: `--limit` `10/20/30/40/60/100` (default `10`) · `--filter` `exceptVote`(default)\|`all` controls whether consensus vote transactions are included. Response is a flat, unpaginated array of transaction summaries (slot/fee/status/signer/instructions), not full detail — full field-by-field breakdown: [responses/transaction-last.md](responses/transaction-last.md).

**`fees`**: No options — takes no flags. Response is a single flat object with `avg_fee`/`min_fee`/`max_fee`, a network-wide snapshot (not scoped to any account or transaction), values in **SOL** (not lamports) — full field-by-field breakdown: [responses/transaction-fees.md](responses/transaction-fees.md).

Use `actions`/`actions-multi` when the user wants "what happened in this tx" — it's already decoded into human terms. Use `detail`/`detail-multi` when you need raw balance-change/instruction-level data. Note `detail`'s `status` is numeric (`1`/`0`) while `last`'s `status` is a string (`"Success"`/`"Fail"`) — don't branch on it generically across actions.

## Response Fields

Field-by-field description of each action's JSON response (types, meaning, edge cases): [responses/transaction.md](responses/transaction.md) (index + shared envelope) → [responses/transaction-last.md](responses/transaction-last.md) (`last`) / [responses/transaction-detail.md](responses/transaction-detail.md) (`detail`, `detail-multi`) / [responses/transaction-instructions.md](responses/transaction-instructions.md) (nested `parsed_instructions` tree) / [responses/transaction-actions.md](responses/transaction-actions.md) (`actions`, `actions-multi`) / [responses/transaction-fees.md](responses/transaction-fees.md) (`fees`).

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
