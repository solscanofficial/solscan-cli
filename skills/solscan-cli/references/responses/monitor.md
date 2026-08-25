# Monitor Response Fields

Field-by-field description of the JSON the `monitor <action>` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../monitor.md](../monitor.md) for flags/params).

This index only holds the envelope shared by every action. Field-level docs live in the topic file:

| File | Covers | Actions |
|------|--------|---------|
| [monitor-usage.md](monitor-usage.md) | Subscription dates and Compute Unit (CU) usage for the resolved API key | `usage` |

## Common envelope

Every action wraps its payload the same way:

| Field | Type | Description |
|-------|------|--------------|
| `success` | boolean | `true` on `200 OK`. |
| `data` | object | The actual payload, shaped per action (see the topic file above). |

On failure (`400`/`401`/`429`/`500`), `success` is `false` and `data` is replaced by:

| Field | Type | Description |
|-------|------|--------------|
| `errors.code` | number | API error code (distinct from the HTTP status). Not always present — e.g. `400` responses may return just `errors.message`. |
| `errors.message` | string | Human-readable error description, e.g. `"Token is invalid"`, `"Invalid token"`, `"Too many requests, please try again later."` |
