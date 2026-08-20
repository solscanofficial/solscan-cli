# Transaction Response Fields — Actions

Field-by-field description of the JSON the `transaction actions` and `transaction actions-multi` commands return. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../transaction.md](../transaction.md) for flags/params). Shared envelope/error shape: [transaction.md](transaction.md#common-envelope).

This covers the **decoded, human-facing actions view** — a pre-summarized "what happened" (transfers, swaps, liquidity/NFT activity) as opposed to [`detail`](transaction-detail.md)'s raw instruction-by-instruction tree. It's the smaller of the two shapes; use this when the caller wants a narrative of the transaction, and `detail`/`detail-multi` when they need the full CPI-level breakdown.

Every field below was verified against live responses from `solscan transaction actions`/`actions-multi` (2026-08-20), not just Solscan's published schema.

> **Native SOL address convention:** wherever this file shows a `token_address` field — `transfers[].token_address`, `transfers[].base_value.token_address`, or a `token_1`/`token_2`/`token_address` inside `activities[].data`/`one_line_summary.data` — native SOL is represented by the placeholder mint `So11111111111111111111111111111111111111111` (45 characters). This is **not** the real wrapped-SOL mint `So11111111111111111111111111111111111111112` (44 characters, one fewer `1`) — that address shows up separately when a transfer actually moves tokenized/wrapped SOL as an SPL token (e.g. inside a swap). Confirm which is meant by checking `program_id`: `11111111111111111111111111111111` (System Program) means native SOL; `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` (SPL Token program) means an actual SPL-token transfer, wrapped SOL included.

## Contents

- [`actions`](#actions)
- [`actions-multi`](#actions-multi)
- [Top-level `data` fields](#top-level-data-fields)
- [`one_line_summary`](#one_line_summary)
- [`summaries` item fields](#summaries-item-fields)
- [`transfers` item fields](#transfers-item-fields)
- [`activities` item fields](#activities-item-fields)
- [`outer_*` vs `real_outer_*`](#outer_-vs-real_outer_)
- [Envelope-level `metadata.tokens`](#envelope-level-metadatatokens)
- [Interpretation tips](#interpretation-tips)

## `actions`

`solscan transaction actions --signature <SIG>`

`data` is a single **object** — see [Top-level `data` fields](#top-level-data-fields).

## `actions-multi`

`solscan transaction actions-multi --signatures <SIG,SIG,...>` (max 50)

`data` is an **array**, one object per requested signature, **in the same order as `--signatures`** — each item has the identical shape documented below for `actions`' single object. `metadata.tokens` is a single map **shared across the whole batch** (every mint referenced by any transaction in the request, merged into one object) — not one map per transaction.

## Top-level `data` fields

| Field | Type | Description |
|-------|------|--------------|
| `tx_hash` | string | The transaction signature (echoes the queried `--signature`/entry in `--signatures`). |
| `block_id` | number | Slot number the transaction was confirmed in. |
| `block_time` | number | Unix timestamp (seconds) of the slot. |
| `time` | string | ISO 8601 timestamp of the slot (`block_time`, human-readable). |
| `fee` | number | Total transaction fee, in **lamports**. |
| `priority_fee` | number | Priority fee portion of `fee`, in lamports. `0` when no priority fee was set. |
| `one_line_summary` | object | The single most important activity in the transaction, pre-picked by Solscan — see [`one_line_summary`](#one_line_summary). |
| `summaries` | array of object | Grouped, titled view of the transaction's main activities — see [`summaries` item fields](#summaries-item-fields). Can be `[]` for transactions with no summarizable activity (e.g. a bare compute-budget-only transaction). |
| `transfers` | array of object | Flat list of every SOL/SPL transfer in the transaction, across all instructions — see [`transfers` item fields](#transfers-item-fields). Can be `[]`. |
| `activities` | array of object | Flat list of every decoded activity in the transaction (transfers-as-events, swaps, compute-budget settings, account lifecycle, etc.) — see [`activities` item fields](#activities-item-fields). |

There is no `status`/`compute_units_consumed`/`signer` field here — those only exist on [`detail`](transaction-detail.md#top-level-data-fields)/[`last`](transaction-last.md). If the caller needs success/failure status, use `detail` or `last` instead.

## `one_line_summary`

Solscan's pick of the single most representative activity in the transaction. Two shapes observed:

**Typical case** — a single dominant activity:

| Field | Type | Description |
|-------|------|--------------|
| `activity_type` | string | e.g. `"ACTIVITY_TOKEN_SWAP"`, `"ACTIVITY_TOKEN_ADD_LIQ"`. Same value space as `activities[].activity_type`. |
| `program_id` | string | Address of the program that produced the summarized activity. |
| `data` | object | Activity-specific payload — shape varies entirely by `activity_type` (see [`activities` item fields](#activities-item-fields) for per-type shapes; `one_line_summary.data` uses the same per-type shapes). |

**Fallback case** — when no single activity dominates (observed on transactions Solscan can't confidently summarize, e.g. an unrecognized/opaque program call):

```json
{
  "activity_type": "MULTI_INTERACTIONS",
  "data": {
    "program_instruction_maps": {
      "<program_id>": ["Unknown"]
    }
  }
}
```

`activity_type: "MULTI_INTERACTIONS"` has **no `program_id` field at all** (not `null` — the key is absent), and `data` holds `program_instruction_maps` (program address → array of instruction names, often just `["Unknown"]`) instead of the per-activity-type shape used elsewhere. Code reading `one_line_summary.program_id` unconditionally will get `undefined` on this shape — check `activity_type` first.

## `summaries` item fields

`summaries` groups the transaction's activities under a title, roughly "one entry per top-level instruction that produced something summarizable":

| Field | Type | Description |
|-------|------|--------------|
| `title` | object | Same shape as [`one_line_summary`](#one_line_summary) (`activity_type`/`program_id`/`data`) — the heading for this group. Commonly `activity_type: "INTERACTION"` for a plain program-invocation title, or a specific activity type (e.g. `"ACTIVITY_TOKEN_SWAP"`) when the whole group *is* that activity. |
| `body` | array of object | The activities under this title, each shaped `{ activity_type, program_id, data }` — same per-type `data` shapes as [`activities`](#activities-item-fields), but **without** the `ins_index`/`outer_ins_index`/`outer_program_id`/`real_outer_*` positional fields that top-level `activities[]` entries carry. |

## `transfers` item fields

Flat, transaction-wide list — every SOL/SPL movement regardless of which instruction produced it:

| Field | Type | Description |
|-------|------|--------------|
| `source_owner` | string | Owner (wallet) address of the source account. |
| `source` | string | Source account address — a token account for SPL transfers, the wallet itself for native SOL. |
| `destination` | string | Destination account address, same convention as `source`. |
| `destination_owner` | string | Owner (wallet) address of the destination account. |
| `transfer_type` | string | `"ACTIVITY_SPL_TRANSFER"`, `"ACTIVITY_SPL_CREATE_ACCOUNT"`, `"ACTIVITY_SPL_CLOSE_ACCOUNT"`,... — what kind of movement this is. |
| `token_address` | string | Mint address of the token moved — see the **Native SOL address convention** note near the top of this file for what this is when the movement is native SOL. |
| `decimals` | number | Decimals for `token_address`. |
| `amount` | number (usually) | Amount moved, in raw base units. **Occasionally a string instead of a number** for the same field on `ACTIVITY_SPL_CLOSE_ACCOUNT` legs. Don't assume the type; coerce before arithmetic. |
| `amount_str` | string | Same value as `amount`, always string-encoded — prefer this for exact/bignum-safe math regardless of `amount`'s runtime type. |
| `program_id` | string | Program that executed the transfer instruction. |
| `outer_program_id` | string \| null | `program_id` of the **top-level** instruction this transfer's CPI subtree hangs off of, if any — not necessarily the instruction that directly triggered it once nesting is 3+ levels deep, see [`outer_*` vs `real_outer_*`](transaction-instructions.md#outer_-vs-real_outer_). `null` for a transfer that isn't nested inside another program's instruction. |
| `ins_index` | number | Index of the instruction that produced this transfer. |
| `outer_ins_index` | number | `ins_index` of that same top-level instruction if this transfer came from a CPI; `-1` if not nested. Transfers carry no `real_outer_ins_index` counterpart, so there's no way to recover the immediate CPI caller from a transfer alone. |
| `extra_data` | object | Present on most transfers (can be `{}`). Carries type-specific extras — e.g. `{ owner, space }` on `ACTIVITY_SPL_CREATE_ACCOUNT`. Absent entirely on some `ACTIVITY_SPL_CLOSE_ACCOUNT` legs. |
| `base_value` | object | **Only present on swap-related transfer legs** — the equivalent value on the *other* side of a trade, shaped `{ token_address, decimals, amount, amount_str }`. Use it to compute an implied swap price without a separate price lookup. |

## `activities` item fields

Flat, transaction-wide list of every decoded activity — includes things that never made it into `summaries` (e.g. `ComputeBudget` settings):

| Field | Type | Description |
|-------|------|--------------|
| `name` | string | Human-readable activity name, e.g. `"ComputeBudget"`, `"createAccount"`, `"PumpFunAmmSwap"`, `"closeAccount"`, `"MeteoraDlmmAddLiquidity"`. |
| `activity_type` | string | Machine-readable category — eg: `ACTIVITY_COMPUTE_UNIT_LIMIT`, `ACTIVITY_COMPUTE_UNIT_PRICE`, `ACTIVITY_SPL_CREATE_ACCOUNT`, `ACTIVITY_SPL_CLOSE_ACCOUNT`, `ACTIVITY_SPL_COMMON`, `ACTIVITY_TOKEN_SWAP`, `ACTIVITY_AGG_TOKEN_SWAP`, `ACTIVITY_TOKEN_ADD_LIQ`, `ACTIVITY_OPEN_POSITION`,.... |
| `program_id` | string | Address of the program that produced this activity. |
| `data` | object | Activity-specific payload — **shape varies entirely by `activity_type`** (swap activities carry `token_1`/`token_2`/`amount_1`/`amount_2`/owners, a compute-budget activity carries `compute_unit_limit`, etc). Treat as `unknown` and branch on `activity_type` before reading fields. |
| `ins_index` | number | Index of the owning instruction. |
| `outer_ins_index` | number | `ins_index` of the **top-level** instruction this activity's CPI subtree hangs off of; `-1` if the activity itself is top-level. Not the immediate CPI caller once nesting is 3+ levels deep — see [`outer_*` vs `real_outer_*`](transaction-instructions.md#outer_-vs-real_outer_). |
| `outer_program_id` | string \| null | `program_id` of that same top-level instruction; `null` if top-level. Same caveat as `outer_ins_index`. |
| `real_outer_ins_index` | number | `ins_index` of the **immediate** instruction that actually invoked this activity via CPI — unlike `outer_ins_index`, not pinned to the top-level instruction, and differs from it once nesting is 3+ levels deep (see [`outer_*` vs `real_outer_*`](transaction-instructions.md#outer_-vs-real_outer_) for a worked A→B→C example). `-1` for a top-level activity. **Not present on every activity** — see the note below. |
| `real_outer_program_id` | string \| null | `program_id` of that immediate caller. Same semantics/caveat as `real_outer_ins_index`. `null` for a top-level activity. **Not present on every activity** — see the note below. |

**Presence note:** `real_outer_ins_index`/`real_outer_program_id` are absent (not `null` — the keys are missing) specifically on `ACTIVITY_SPL_CREATE_ACCOUNT` activities; every other `activity_type` observed carries both. The same pair also shows up on the `activities[]` nested inside [`detail`'s `parsed_instructions`](transaction-instructions.md#activities-item-fields), following the identical rule (absent on `spl_createaccount`, present elsewhere) — see the fuller presence note there, which also covers `program_invoke_level`/`inst_type` traveling in the same bundle.

## `outer_*` vs `real_outer_*`

`outer_ins_index`/`outer_program_id` (on `transfers[]` and `activities[]`) and `real_outer_ins_index`/`real_outer_program_id` (`activities[]` only) both describe where a flattened `transfers`/`activities` entry sits in the transaction's CPI call stack, but they answer different questions once a program invokes another program that itself invokes a third program. For a CPI stack **program A → program B → program C** (A invokes B via CPI, B invokes C via CPI):

| Item | `outer_ins_index` / `outer_program_id` | `real_outer_ins_index` / `real_outer_program_id` |
|---|---|---|
| A transfer/activity produced by **B** (direct child of A) | `ins_index`/`program_id` of **A** | `ins_index`/`program_id` of **A** — identical to `outer_*`, since A is both B's top-level ancestor and its immediate caller |
| A transfer/activity produced by **C** (child of B, grandchild of A) | `ins_index`/`program_id` of **A** — still the top-level instruction, **not** B | `ins_index`/`program_id` of **B** — C's actual, immediate caller |

In short:

- `outer_ins_index`/`outer_program_id` always point at the **top-level instruction** the whole CPI subtree hangs off of — regardless of how many CPI hops deep the transfer/activity actually originated from.
- `real_outer_ins_index`/`real_outer_program_id` (activities only) point at the **immediate caller** — whichever instruction literally invoked this one, which can be several levels below the top-level instruction.

The two pairs only diverge starting at the third nesting level (C and deeper); for a top-level activity/transfer or one produced by a direct (single-hop) CPI child like B, `outer_*` and `real_outer_*` always agree — and both collapse to the trivial `-1`/`null` on a top-level entry, since there's no CPI parent to point at. `transfers[]` has no `real_outer_*` counterpart, so a transfer alone can't tell you its immediate caller past this same "top-level only" `outer_*` — cross-reference the owning `activities[]`/`summaries[].body` entry (matching on `ins_index`/`outer_ins_index`) if you need that. Full worked-through detail, including how this plays out inside `detail`'s recursive `parsed_instructions` tree: [transaction-instructions.md](transaction-instructions.md#outer_-vs-real_outer_).

## Envelope-level `metadata.tokens`

Same convention as [`detail`](transaction-detail.md#envelope-level-metadatatokens) — a sibling of `data` holding display metadata for every token mint referenced anywhere in the transaction(s):

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

Observed live: `metadata` can be a **fully empty object `{}`** (no `tokens` key at all) when the transaction touches no known token mints — e.g. a compute-budget-only or unrecognized-program transaction. Guard with `metadata?.tokens ?? {}` rather than assuming `metadata.tokens` always exists.

For `actions-multi`, `metadata.tokens` is **one map shared across every transaction in the batch** — look up a mint here regardless of which `data[i]` entry referenced it.

## Interpretation tips

- Use `actions`/`actions-multi` when the caller wants "what happened in this transaction" in human terms; use [`detail`/`detail-multi`](transaction-detail.md) when they need the raw CPI/instruction-level tree. `actions`' response is much smaller and pre-decoded, at the cost of a couple of loosely-typed fields (`transfers[].amount`, see above) that `detail` doesn't have.
- There's no `status` field here — if the caller needs to know whether the transaction succeeded, call `detail` or `last` instead (and remember `detail`'s `status` is numeric while `last`'s is a string — see [transaction-detail.md](transaction-detail.md#interpretation-tips)).
- `summaries[].body` and top-level `activities[]`/`transfers[]` overlap in content (the same swap/transfer shows up in both) but are **not** the same list — `summaries` groups by top-level instruction for display, while `activities`/`transfers` are flat, transaction-wide lists with positional (`ins_index`) metadata. Pick one source per use case rather than merging both, to avoid double-counting.
- `activities-multi`'s **whole-request-fails** behavior matches other multi-signature actions in this CLI: one invalid signature in `--signatures` returns `400` (`errors.code`) for the entire call — there's no partial-success mode.
- `metadata.tokens` is a convenience map, not a substitute for `token meta` — it only carries display fields (`token_name`/`token_symbol`/`token_icon`), not supply/authority/market data.
