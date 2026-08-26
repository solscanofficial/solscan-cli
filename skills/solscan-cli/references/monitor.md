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

## Plans, Pricing & Rate Limits

`monitor usage` reports consumption against whichever plan the resolved API key is subscribed to. Use this table to interpret the numbers it returns, and to diagnose `403`/`429` errors elsewhere in the CLI.

| Plan | Price/mo | Monthly CU | Rate Limit (req/60s) | Endpoint access |
|---|---|---|---|---|
| Lite | $49 | 20,000,000 | 1,000 | Full API **minus** `account metadata`, `account metadata-multi`, `account funded-by`, and any bulk `*-multi` endpoints |
| Level 2 | $199 | 150,000,000 | 1,000 | Full endpoint access |
| Level 3 | $399 | 500,000,000 | 2,000 | Full endpoint access |
| Level 4 | $1,099 | 1,500,000,000 | 3,000 | Full endpoint access |
| Enterprise | Contact Solscan | Custom | Custom | Custom |

- **CU cost**: a standard single-item endpoint call costs **100 CU**, regardless of plan. `*-export` commands cost **200 CU** per call. `*-multi` bulk endpoints cost **100 CU × number of addresses/signatures passed** — e.g. `account metadata-multi --addresses a,b,c` (3 addresses) costs 300 CU, `transaction detail-multi` with 50 signatures costs 5,000 CU. All of this is deducted from the monthly pool; `monitor usage` shows CU remaining/used against that pool plus a rolling 24h window of request count/success rate/CU spend.
- **Top-up CUs do not roll over** between billing cycles — unused top-up units expire at period end, so don't advise the user to bank them for later.
- **Lite-plan `403`s**: if `monitor usage` shows the Lite plan and a call to `account metadata`, `account metadata-multi`, `account funded-by`, or any `*-multi` action returns `403`, that's the plan exclusion, not a bug — tell the user they need Level 2+ rather than retrying.
- **Rate limits** are per 60-second window and independent of the 10 req/min cap on `*-export` commands (see [../SKILL.md](../SKILL.md) Core Concepts) — a `429` on a non-export call means the plan's req/60s ceiling was hit.

## Examples

```bash
solscan monitor usage
solscan monitor usage --no-json
```
