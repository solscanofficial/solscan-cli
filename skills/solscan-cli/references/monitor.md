# Monitor Reference

```bash
solscan monitor <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|----------|
| `usage` | Your API key's Compute Unit (CU) usage and subscription status | — | — |

## Option details

**`usage`**: No options — takes no flags, always reports on the API key resolved for the request (flag > env var > stored config). Response is a single flat object covering subscription dates and CU consumption (total remaining/used, plus a rolling 24h window of request count/success rate/CU spend) — full field-by-field breakdown: [responses/monitor-usage.md](responses/monitor-usage.md).

## Response Fields

Field-by-field description of the JSON response (types, meaning, edge cases): [responses/monitor.md](responses/monitor.md) (index + shared envelope) → [responses/monitor-usage.md](responses/monitor-usage.md) (`usage`).

## Examples

```bash
solscan monitor usage
solscan monitor usage --no-json
```
