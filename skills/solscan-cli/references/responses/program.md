# Program Response Fields

Field-by-field description of the JSON each `program <action>` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../program.md](../program.md) for flags/params).

This index only holds the envelope shared by every action. Field-level docs live in one file per action:

| File | Covers | Action |
|------|--------|--------|
| [program-list.md](program-list.md) | Chain-wide ranking of all programs active in the last 90 days | `list` |
| [program-popular.md](program-popular.md) | Curated list of popular DeFi platforms and their program IDs | `popular` |
| [program-analytics.md](program-analytics.md) | Aggregate + daily on-chain stats for one program over a 7/30-day window | `analytics` |

## Common envelope

Every action wraps its payload the same way:

| Field | Type | Description |
|-------|------|--------------|
| `success` | boolean | `true` on `200 OK`. |
| `data` | object \| array | The actual payload, shaped per action (see the topic files above). |
| `metadata` | object | Present on success; empty (`{}`) on both documented actions so far. |

On failure (`401`/`429`/`500`, and `400` for `analytics`), `success` is `false` and `data`/`metadata` are replaced by:

| Field | Type | Description |
|-------|------|--------------|
| `errors.code` | number | API error code (distinct from the HTTP status). Absent on some `400` responses — check `errors.message` alone in that case. |
| `errors.message` | string | Human-readable error description, e.g. `"Validation Error: Address [...] is invalid"`. |
