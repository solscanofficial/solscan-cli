# Transaction Response Fields

Field-by-field description of the JSON each `transaction <action>` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../transaction.md](../transaction.md) for flags/params).

This index only holds the envelope shared by every action. Field-level docs live in topic files:

| File | Covers | Actions |
|------|--------|---------|
| [transaction-last.md](transaction-last.md) | The most recent transactions on the network — summary shape, not full detail | `last` |
| [transaction-detail.md](transaction-detail.md) | Full parsed transaction detail — balance changes, top-level fields, envelope `metadata.tokens` | `detail`, `detail-multi` |
| [transaction-instructions.md](transaction-instructions.md) | The recursive `parsed_instructions`/`inner_instructions` tree (activities, transfers, IDL args) referenced from `transaction-detail.md` | `detail`, `detail-multi` |
| [transaction-actions.md](transaction-actions.md) | Decoded actions view — `one_line_summary`, `summaries`, flat `transfers`/`activities`, envelope `metadata.tokens` | `actions`, `actions-multi` |

> `fees` isn't covered yet — fall back to the `--no-json` output or `--help`, and treat unlabeled fields at face value rather than guessing their meaning.

## Common envelope

Every action wraps its payload the same way:

| Field | Type | Description |
|-------|------|--------------|
| `success` | boolean | `true` on `200 OK`. |
| `data` | object \| array | The actual payload, shaped per action (see the topic files above). |

On failure (`400`/`401`/`429`/`500`), `success` is `false` and `data` is replaced by:

| Field | Type | Description |
|-------|------|--------------|
| `errors.code` | number | API error code (distinct from the HTTP status). |
| `errors.message` | string | Human-readable error description, e.g. `"Validation Error: tx is not allowed"`. |
