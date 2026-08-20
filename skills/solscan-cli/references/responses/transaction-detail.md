# Transaction Response Fields — Detail

Field-by-field description of the JSON the `transaction detail` and `transaction detail-multi` commands return. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../transaction.md](../transaction.md) for flags/params). Shared envelope/error shape: [transaction.md](transaction.md#common-envelope).

This covers **full parsed transaction detail** — SOL/SPL balance changes, per-instruction breakdown (including nested CPI instructions), decoded activities, transfers, and raw IDL args. It's the heaviest of the transaction response shapes, as opposed to [`last`](transaction-last.md) (a thin recent-activity feed) or `actions`/`actions-multi` (a smaller, already-decoded summary — not yet documented at field level).

The `parsed_instructions` tree is shared, recursive structure — documented separately in [transaction-instructions.md](transaction-instructions.md) so this file stays focused on the outer transaction shape.

## Contents

- [`detail`](#detail)
- [`detail-multi`](#detail-multi)
- [Top-level `data` fields](#top-level-data-fields)
- [`sol_bal_change` item fields](#sol_bal_change-item-fields)
- [`token_bal_change` item fields](#token_bal_change-item-fields)
- [`account_keys` item fields](#account_keys-item-fields)
- [Envelope-level `metadata.tokens`](#envelope-level-metadatatokens)
- [Interpretation tips](#interpretation-tips)

## `detail`

`solscan transaction detail --signature <SIG>`

`data` is a single **object** — see [Top-level `data` fields](#top-level-data-fields).

## `detail-multi`

`solscan transaction detail-multi --signatures <SIG,SIG,...>` (max 50)

`data` is an **array**, one object per requested signature, **in the same order as `--signatures`** — each item has the identical shape documented below for `detail`'s single object. No pagination; this is a direct batch of the single-transaction shape.

## Top-level `data` fields

| Field | Type | Description |
|-------|------|--------------|
| `tx_hash` | string | The transaction signature (echoes the queried `--signature`/entry in `--signatures`). |
| `block_id` | number | Slot number the transaction was confirmed in. |
| `block_time` | number | Unix timestamp (seconds) of the slot. |
| `fee` | number | Total transaction fee, in **lamports**. |
| `priority_fee` | number | Priority fee portion of `fee`, in lamports (microlamports-per-compute-unit × compute units, already converted). `0` when no priority fee was set. |
| `status` | number | `1` for success, `0` for failure. **Numeric here, unlike [`last`](transaction-last.md)'s `status`, which is the string `"Success"`/`"Fail"`** — don't branch on `status` generically across both actions. |
| `compute_units_consumed` | number | Total compute units consumed by the transaction. |
| `reward` | array | Reward info for this transaction; typically empty (`[]`) outside of vote/staking-adjacent transactions. |
| `signer` | array of string | The transaction's fee-payer/signer address(es). |
| `programs_involved` | array of string | Deduplicated list of every program address invoked anywhere in the transaction, including via CPI. |
| `sol_bal_change` | array of object | Native SOL balance deltas per account touched — see [`sol_bal_change` item fields](#sol_bal_change-item-fields). |
| `token_bal_change` | array of object | SPL token balance deltas per token account touched — see [`token_bal_change` item fields](#token_bal_change-item-fields). |
| `parsed_instructions` | array of object | The transaction's top-level instructions, in execution order. Full breakdown (including nested `inner_instructions`, `activities`, `transfers`, `idl_data`): [transaction-instructions.md](transaction-instructions.md). |
| `address_table_lookup` | array | Addresses the transaction loaded from on-chain address lookup tables (versioned transactions only). Empty (`[]`) for legacy transactions or versioned ones that don't use a lookup table. |
| `log_message` | array of string \| null | Raw program log lines in emission order, or `null` if log recording wasn't enabled for this transaction. |

Live responses consistently carry additional fields **not listed in Solscan's formal schema** — treat these as present-in-practice rather than contractually guaranteed:

| Field | Type | Description |
|-------|------|--------------|
| `list_signer` | array of string | Observed identical to `signer` in practice; no confirmed distinction — prefer `signer`. |
| `tokens_involved` | array of string | Deduplicated mint addresses referenced anywhere in the transaction (balance changes + transfers). |
| `account_keys` | array of object | Every account referenced by the transaction, with role metadata — see [`account_keys` item fields](#account_keys-item-fields). |
| `confirmations` | null | Observed always `null` in practice. |
| `version` | string \| number | Transaction version — `"legacy"` or a numeric version (e.g. `0`) for versioned transactions. |
| `recent_block_hash` | string | The blockhash the transaction referenced for recency/replay protection. |
| `tx_status` | string | Confirmation status label, e.g. `"finalized"`. |

## `sol_bal_change` item fields

| Field | Type | Description |
|-------|------|--------------|
| `address` | string | Account address whose native SOL balance changed (or was read, even if unchanged). |
| `pre_balance` | string | Balance before the transaction, in lamports, string-encoded. |
| `post_balance` | string | Balance after the transaction, in lamports, string-encoded. |
| `change_amount` | string | `post_balance - pre_balance`, in lamports, string-encoded — negative for decreases. Every account touched by the transaction appears here, including ones with `change_amount: "0"` (e.g. read-only accounts). |

## `token_bal_change` item fields

| Field | Type | Description |
|-------|------|--------------|
| `address` | string | The SPL token account address whose balance changed. |
| `token_address` | string | Mint address of the token held by `address`. |
| `change_type` | string | `"inc"` or `"dec"`. |
| `change_amount` | string | Signed raw-unit delta, string-encoded (matches the sign implied by `change_type`). |
| `decimals` | number | Decimals for `token_address`, to convert raw units to a human-readable amount. |
| `pre_balance` | string | Token account balance before the transaction, raw units, string-encoded. |
| `post_balance` | string | Token account balance after the transaction, raw units, string-encoded. |
| `owner` | string | Current owner wallet of the token account. |
| `pre_owner` | string | Owner of the token account before the transaction (differs from `owner`/`post_owner` only if the transaction reassigned ownership). |
| `post_owner` | string | Owner of the token account after the transaction. |

## `account_keys` item fields

| Field | Type | Description |
|-------|------|--------------|
| `pubkey` | string | The account address. |
| `signer` | boolean | Whether this account signed the transaction. |
| `writable` | boolean | Whether this account was writable in the transaction. |
| `source` | string | Where the account came from, e.g. `"transaction"` for accounts listed directly in the transaction message (as opposed to ones pulled from an address lookup table). |

## Envelope-level `metadata.tokens`

Unlike most other resources, `transaction detail`/`detail-multi` responses carry a top-level `metadata` object **as a sibling of `data`**, holding display metadata for every token mint referenced anywhere in the transaction:

```json
{
  "success": true,
  "data": { "...": "..." },
  "metadata": {
    "tokens": {
      "<mint address>": {
        "token_address": "...",
        "token_name": "...",
        "token_symbol": "...",
        "token_icon": "..."
      }
    }
  }
}
```

`metadata.tokens` is keyed by mint address — look up any mint seen in `sol_bal_change`/`token_bal_change`/`transfers` here to label it without a follow-up `token meta` call. Can be `{}` (or `{ "tokens": {} }`) when the transaction only touches unknown/unlisted tokens, or native SOL only.

**Example** (per [Solscan's published reference](https://pro-api.solscan.io/v2.0/transaction/detail), trimmed to the outer shape — see [transaction-instructions.md](transaction-instructions.md) for a `parsed_instructions` entry in full):

```json
{
  "success": true,
  "data": {
    "block_id": 319312375,
    "fee": 6000,
    "priority_fee": 1000,
    "reward": [],
    "sol_bal_change": [
      { "address": "BQDXQXpEBj5ehqKBPFkavTLt2H7c7vg6QxY1ddjwynSx", "pre_balance": "61773386454", "post_balance": "61773388751", "change_amount": "2297" }
    ],
    "token_bal_change": [
      {
        "address": "4Xo1YUNAmPjqnbJfqDfraCrqALyTYgVDQk92gk2hoS55",
        "change_type": "dec",
        "change_amount": "-8297",
        "decimals": 9,
        "post_balance": "97346885084",
        "pre_balance": "97346893381",
        "token_address": "So11111111111111111111111111111111111111112",
        "owner": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
        "post_owner": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
        "pre_owner": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1"
      }
    ],
    "programs_involved": [
      "ComputeBudget111111111111111111111111111111",
      "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
    ],
    "parsed_instructions": ["...see transaction-instructions.md..."],
    "signer": ["BQDXQXpEBj5ehqKBPFkavTLt2H7c7vg6QxY1ddjwynSx"],
    "status": 1,
    "compute_units_consumed": 54859,
    "tx_hash": "F16MuS9H67iSTdHqtfRXF4e6DaVVdQSnuBYRzGcFYXrJhgFS3zxmKeRpGNFjYrewT2738u59NA6wXfp2t7KwDSd",
    "block_time": 1739026554,
    "log_message": ["Program ComputeBudget111111111111111111111111111111 invoke [1]", "..."],
    "address_table_lookup": []
  },
  "metadata": {
    "tokens": {
      "So11111111111111111111111111111111111111112": {
        "token_address": "So11111111111111111111111111111111111111112",
        "token_name": "Wrapped SOL",
        "token_symbol": "SOL",
        "token_icon": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
      }
    }
  }
}
```

## Interpretation tips

- `status` is numeric (`1`/`0`) here but a string (`"Success"`/`"Fail"`) in [`last`](transaction-last.md#item-fields) — code that handles both actions needs to normalize, not compare directly.
- `fee`/`priority_fee` are in lamports (`fee` includes `priority_fee`, it's not additive on top).
- `sol_bal_change`/`token_bal_change` list **every** account touched, including ones with a zero `change_amount` — filter client-side (`change_amount !== "0"`) if you only want accounts whose balance actually moved.
- `detail-multi`'s `data` array preserves request order — index by position (`data[i]` ↔ `--signatures` entry `i`) rather than matching on `tx_hash`, unless you specifically need to guard against a hypothetical reordering.
- Same **whole-request-fails** behavior as other multi-address/signature actions in this CLI: one invalid signature in `--signatures` returns `400` (`errors.code`) for the entire call — there's no partial-success mode where valid signatures still come back.
- This is the heaviest transaction shape in the API — a busy DeFi transaction's `parsed_instructions` (with nested `inner_instructions`) can be large. If the user just wants "what happened" in human terms, use `transaction actions`/`actions-multi` instead for a much smaller, pre-decoded response.
- `metadata.tokens` is a convenience map, not a substitute for `token meta` — it only carries display fields (`token_name`/`token_symbol`/`token_icon`), not supply/authority/market data.
