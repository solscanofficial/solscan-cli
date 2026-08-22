# Transaction Response Fields — Fees

Field-by-field description of the JSON the `transaction fees` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../transaction.md](../transaction.md) for flags/params). Shared envelope/error shape: [transaction.md](transaction.md#common-envelope).

This is a **network-wide fee snapshot** — three numbers summarizing recent transaction fees across Solana — not scoped to any account or transaction. There are no options: `solscan transaction fees` takes no flags.

## `fees`

`solscan transaction fees`

`data` is a single flat object — no array, no pagination.

| Field | Type | Description |
|-------|------|--------------|
| `avg_fee` | number | Average transaction fee, in **SOL** (not lamports). |
| `min_fee` | number | Minimum transaction fee observed, in **SOL**. |
| `max_fee` | number | Maximum transaction fee observed, in **SOL** — can be orders of magnitude above `avg_fee` when priority fees spike. |

**Example** (from [Solscan's published reference](https://pro-api.solscan.io/v2.0/transaction/fees)):

```json
{
  "success": true,
  "data": {
    "avg_fee": 0.00001164,
    "min_fee": 0.000005,
    "max_fee": 0.003039914
  }
}
```

## Interpretation tips

- Units are **SOL**, not lamports — this is the opposite convention from `transaction last`'s `fee` field, which is lamports. Don't reuse a `/1e9` conversion here; these values are already human-readable SOL amounts.
- `min_fee` sits near Solana's base fee (5000 lamports = `0.000005` SOL per signature) — treat values persistently above that as a sign of active priority-fee bidding, not an error.
- The gap between `avg_fee` and `max_fee` can be large (in the example, `max_fee` is ~260x `avg_fee`) because a handful of transactions paying high priority fees during congestion pull the max up without moving the average much — don't treat `max_fee` as representative of typical cost.
- There's no time window, `slot`, or `count` field — this is a live snapshot at request time, not a historical series. If the user wants fee trends over time, this endpoint can't provide that; there's no equivalent action in this CLI for historical fee data.
