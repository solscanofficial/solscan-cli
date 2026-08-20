# Transaction Response Fields — Parsed Instructions

Field-by-field description of the `parsed_instructions` tree returned by `transaction detail`/`detail-multi` (see [transaction-detail.md](transaction-detail.md) for the fields around it, [transaction.md](transaction.md#common-envelope) for the envelope). Split out into its own file because the structure is recursive and reused verbatim for `inner_instructions`.

## Contents

- [`parsed_instructions` item fields](#parsed_instructions-item-fields)
- [`inner_instructions`](#inner_instructions)
- [`outer_*` vs `real_outer_*`](#outer_-vs-real_outer_)
- [`activities` item fields](#activities-item-fields)
- [`transfers` item fields](#transfers-item-fields)
- [`idl_data`](#idl_data)
- [Interpretation tips](#interpretation-tips)

## `parsed_instructions` item fields

One entry per top-level instruction in the transaction, in execution order:

| Field | Type | Description |
|-------|------|--------------|
| `ins_index` | number | 0-based index of this instruction within its containing list (top-level instructions, or `inner_instructions` for a CPI child). |
| `parsed_type` | string | Solscan's decoded instruction label, e.g. `"raydium:swap"`, `"create"`, `"SetComputeUnitLimit"` — richer/more specific than `type` for recognized DeFi programs. |
| `type` | string | The instruction's method name as declared by the program, e.g. `"swapBaseIn"`, `"create"`, `"setComputeUnitLimit"`. |
| `program_id` | string | Address of the program that owns this instruction. |
| `program` | string | Human-readable program name Solscan resolved for `program_id` (e.g. `"raydium_amm"`, `"spl-token"`, `"ComputeBudget"`). |
| `outer_program_id` | string \| null | For an inner instruction, the `program_id` of the **top-level** instruction this CPI subtree hangs off of — not necessarily the instruction that directly invoked this one; see [`outer_*` vs `real_outer_*`](#outer_-vs-real_outer_). `null` for top-level instructions. |
| `outer_ins_index` | number | For an inner instruction, the `ins_index` of the **top-level** instruction this CPI subtree hangs off of — same caveat as `outer_program_id`. `-1` for top-level instructions. |
| `data_raw` | object \| string | The instruction's decoded arguments. **Shape is inconsistent across instruction types** — see [Interpretation tips](#interpretation-tips). |
| `accounts` | array of string | Account addresses passed to the instruction, when Solscan didn't decode them into `data_raw.info` instead. Frequently empty (`[]`) for recognized programs, since the parsed data usually lands in `data_raw.info`/`activities`/`transfers` instead. |
| `activities` | array of object | Decoded semantic events this instruction produced (swaps, transfers-as-events, compute-budget settings, etc.) — see [Activities item fields](#activities-item-fields). Often empty for instructions Solscan doesn't specifically recognize. |
| `transfers` | array of object | SOL/SPL token movements this instruction caused — see [Transfers item fields](#transfers-item-fields). Empty when the instruction didn't move value. |
| `inner_instructions` | array of object | CPI children of this instruction, **same shape as this table, recursively** — see [`inner_instructions`](#inner_instructions). Only present on instructions that actually invoke other programs; omitted (not just empty) otherwise in some responses. |
| `program_invoke_level` | number | CPI call depth: `1` for a top-level instruction, `2` for a direct CPI child, `3` for a CPI-of-a-CPI, etc. |
| `idl_data` | object | Present only when Solscan holds a matching IDL for `program_id` — see [`idl_data`](#idl_data). Absent (not `null`) when no IDL match exists. |
| `tags` | array of string | Occasionally present, not in the formal schema — seen carrying values like `["mev_tip"]` to flag special-purpose transfers/instructions. Treat as optional metadata, not a guaranteed field. |

## `inner_instructions`

CPI (cross-program invocation) children of a `parsed_instructions` entry. Each item has **exactly the same field set as [`parsed_instructions` item fields](#parsed_instructions-item-fields) above** (including its own possible `inner_instructions`, for multi-level CPI) — this doc doesn't repeat the table. The only practical differences at nested levels:

- `outer_program_id`/`outer_ins_index` point back at the **top-level** instruction instead of being `null`/`-1` — see [`outer_*` vs `real_outer_*`](#outer_-vs-real_outer_) for what "top-level" means once nesting goes past one CPI hop.
- `program_invoke_level` increments by one per nesting level.

## `outer_*` vs `real_outer_*`

`outer_ins_index`/`outer_program_id` (on instructions and activities) and `real_outer_ins_index`/`real_outer_program_id` (activities only, see [`activities` item fields](#activities-item-fields)) both describe where a nested item sits in the CPI call stack, but they answer different questions once nesting goes three levels deep. For a CPI stack **program A → program B → program C** (A invokes B via CPI, B invokes C via CPI):

| Item | `outer_ins_index` / `outer_program_id` | `real_outer_ins_index` / `real_outer_program_id` |
|---|---|---|
| **B**'s instruction/activities (direct child of A) | `ins_index`/`program_id` of **A** | `ins_index`/`program_id` of **A** — identical to `outer_*`, since A is both B's top-level ancestor and its immediate caller |
| **C**'s instruction/activities (child of B, grandchild of A) | `ins_index`/`program_id` of **A** — still the top-level instruction, **not** B | `ins_index`/`program_id` of **B** — C's actual, immediate caller |

In short:

- `outer_ins_index`/`outer_program_id` always point at the **top-level instruction** that anchors the whole CPI subtree — the `parsed_instructions` entry this instruction/activity is ultimately nested under — regardless of how many CPI hops deep it actually sits.
- `real_outer_ins_index`/`real_outer_program_id` point at the **immediate caller** — whichever instruction literally invoked this one, which can be several levels below the top-level instruction.

The two pairs only diverge starting at the third nesting level (C and deeper); for a top-level instruction/activity or a direct (single-hop) CPI child like B, `outer_*` and `real_outer_*` always agree. This is also why both pairs collapse to the same trivial values (`-1`/`null`) on a top-level instruction or activity — there's no CPI parent at all to point at.

## `activities` item fields

| Field | Type | Description |
|-------|------|--------------|
| `name` | string | Human-readable activity name, e.g. `"RaydiumTokenSwap"`, `"ComputeBudget"`, `"createAccount"`. |
| `activity_type` | string | Machine-readable activity category, e.g. `"defi_token_swap"`, `"compute_unit_limit"`, `"spl_createaccount"`, `"spl_common"`. |
| `program_id` | string | Address of the program that produced this activity. |
| `data` | object | Activity-specific payload — shape varies entirely by `activity_type` (e.g. a swap's `data` has `token_1`/`token_2`/`amount_1`/`amount_2`/owners; a compute-budget activity's `data` has `compute_unit_limit`). Treat as `unknown` and branch on `activity_type` before reading fields. |
| `ins_index` | number | Index of the owning instruction. |
| `outer_ins_index` | number | `ins_index` of the **top-level** instruction this activity's CPI subtree hangs off of — `-1` for a top-level activity. Not the immediate caller once nesting is 3+ levels deep; see [`outer_*` vs `real_outer_*`](#outer_-vs-real_outer_). |
| `outer_program_id` | string \| null | `program_id` of that same top-level instruction — `null` for a top-level activity. Same caveat as `outer_ins_index`. |
| `program_invoke_level` | number | Same semantics as the parent instruction's `program_invoke_level`. |
| `inst_type` | string | Mirrors the owning instruction's `parsed_type`. |
| `real_outer_ins_index` | number | `ins_index` of the **immediate** instruction that actually invoked this activity via CPI — unlike `outer_ins_index`, this is not pinned to the top-level instruction, and differs from it once nesting is 3+ levels deep (see [`outer_*` vs `real_outer_*`](#outer_-vs-real_outer_)). `-1` for a top-level activity. **Not present on every activity** — see the note below. |
| `real_outer_program_id` | string \| null | `program_id` of that immediate caller. Same semantics/caveat as `real_outer_ins_index`. `null` for a top-level activity. **Not present on every activity** — see the note below. |

## `transfers` item fields

| Field | Type | Description |
|-------|------|--------------|
| `source_owner` | string | Owner (wallet) address of the source account. |
| `source` | string | Source account address — a token account for SPL transfers, or the wallet itself for native SOL. |
| `destination` | string | Destination account address, same convention as `source`. |
| `destination_owner` | string | Owner (wallet) address of the destination account. |
| `transfer_type` | string | e.g. `"spl_transfer"`, `"spl_createaccount"` — what kind of movement this is. |
| `token_address` | string | Mint address of the token moved. For native SOL, Solscan uses the wrapped-SOL mint address as a placeholder. |
| `decimals` | number | Decimals for `token_address`, to convert `amount`/`amount_str` into a human-readable figure. |
| `amount` | number | Amount moved, in raw base units. For large amounts, prefer `amount_str` to avoid float precision loss. |
| `amount_str` | string | Same value as `amount`, string-encoded — use this for exact/bignum-safe math. |
| `program_id` | string | Program that executed the transfer instruction. |
| `outer_program_id` | string \| null | `program_id` of the **top-level** instruction this transfer's CPI subtree hangs off of, if any — same "top-level, not immediate caller" semantics as [`outer_program_id` on instructions/activities](#outer_-vs-real_outer_). |
| `ins_index` | number | Index of the instruction that produced this transfer. |
| `outer_ins_index` | number | `ins_index` of that same top-level instruction, if this transfer came from a CPI. Transfers have no `real_outer_ins_index` counterpart, so there's no way to recover the immediate CPI caller from a transfer alone — only from its owning activity/instruction. |
| `event` | string | Event label Solscan attached to this transfer, e.g. `"createAccount"` — can be an empty string. |
| `fee` | object | Fee breakdown associated with this specific transfer, if any — typically an empty object (`{}`). |
| `base_value` | object | **Only present on swap-related transfer legs** — the equivalent value on the *other* side of a trade (same shape as a transfer's core fields: `token_address`/`decimals`/`amount`/`amount_str`). Use it to compute an implied swap price without a separate price lookup. |

## `idl_data`

Present only when Solscan has a matching Interface Definition Language (IDL) file for the invoked program. Shape:

```json
{
  "input_args": {
    "<paramName>": { "type": "<rustType>", "data": <decodedValue> }
  }
}
```

Each key under `input_args` is an instruction parameter name as declared in the program's IDL, with its declared type (`u8`, `u32`, `u64`, etc.) and the decoded value.

## Interpretation tips

- `data_raw`'s shape depends entirely on whether Solscan recognizes the program: recognized programs (SPL Token, System Program, most DEX programs) get a structured `{ info: {...}, type: "<name>" }` object; unrecognized/opaque instructions (e.g. `ComputeBudget`'s raw-encoded calls) get a short base64-ish **string** instead. Branch on `parsed_type`/`program` before assuming `data_raw` is an object.
- `idl_data` absence doesn't mean the instruction failed or is unusual — it just means Solscan doesn't hold an IDL for that program. Don't treat a missing `idl_data` as an error signal.
- To reconstruct "everything that happened" inside one top-level instruction, walk `inner_instructions` recursively and accumulate `activities`/`transfers` from every level — a single `activities`/`transfers` array at the top level does **not** already include the nested CPI ones.
- `program_invoke_level` gives you CPI depth without walking the tree yourself — useful for flattening/sorting a call graph.
- Don't use `outer_ins_index`/`outer_program_id` to find an activity's immediate CPI caller in a 3+-level-deep stack — they always resolve to the top-level instruction, not the direct parent. Use `real_outer_ins_index`/`real_outer_program_id` for that instead (activities only; see [`outer_*` vs `real_outer_*`](#outer_-vs-real_outer_)).
- `transfers[].base_value` is the cheapest way to get an implied trade price for a swap leg — no need for a follow-up `token price-latest` call if you already have both `amount`/`base_value.amount` and their `decimals`.
