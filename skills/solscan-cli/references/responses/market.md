# Market Response Fields

Field-by-field description of the JSON each `market <action>` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../market.md](../market.md) for flags/params).

This index only holds the envelope shared by every action. Field-level docs live in one file per action:

| File | Covers | Action |
|------|--------|--------|
| [market-list.md](market-list.md) | Bulk pool/market listing, ranked by 24h volume/trades/creation time | `list` |
| [market-info.md](market-info.md) | A single pool's token reserves and creation metadata | `info` |
| [market-volume.md](market-volume.md) | A single pool's 24h volume/trade snapshot plus daily time series | `volume` |
| [market-positions.md](market-positions.md) | CLMM-styles LP positions in a pool — price ranges and current value | `positions` |

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
| `errors.message` | string | Human-readable error description, e.g. `"Validation Error: Address [...] is invalid"`. |
