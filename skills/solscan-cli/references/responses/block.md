# Block Response Fields

Field-by-field description of the JSON each `block <action>` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../block.md](../block.md) for flags/params).

This index only holds the envelope shared by every action. Field-level docs live in topic files:

| File | Covers | Actions |
|------|--------|---------|
| [block-detail.md](block-detail.md) | Single block's metadata (hash, fee rewards, tx count, parent) | `detail` |
| [block-last.md](block-last.md) | The most recent blocks on the network — same metadata shape as `detail`, as a flat array | `last` |
| [block-transactions.md](block-transactions.md) | Paginated transaction list inside one block — reuses `transaction last`'s item shape | `transactions` |

## Common envelope

Every action wraps its payload the same way:

| Field | Type | Description |
|-------|------|--------------|
| `success` | boolean | `true` on `200 OK`. |
| `data` | object \| array | The actual payload, shaped per action (see the topic files above). |

On failure (`400`/`401`/`429`/`500`), `success` is `false` and `data` is replaced by:

| Field | Type | Description |
|-------|------|--------------|
| `errors.code` | number | API error code (distinct from the HTTP status), e.g. `--block` sent as a non-numeric value. |
| `errors.message` | string | Human-readable error description, e.g. `"Validation Error: block must be a number"`. |
