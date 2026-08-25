# Monitor Response Fields — Usage

Field-by-field description of the JSON the `monitor usage` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../monitor.md](../monitor.md) for flags/params). Shared envelope/error shape: [monitor.md](monitor.md#common-envelope).

This is a **snapshot of the resolved API key's subscription and Compute Unit (CU) consumption** — not scoped to any account, token, or transaction. There are no options: `solscan monitor usage` takes no flags.

## `usage`

`solscan monitor usage`

`data` is a single flat object — no array, no pagination.

| Field | Type | Description |
|-------|------|--------------|
| `renew_date` | string | ISO 8601 timestamp of when the current subscription period started (last renewal). |
| `end_date` | string | ISO 8601 timestamp of when the current subscription period ends. |
| `last_cu_reset_date` | string | ISO 8601 timestamp of the last time the CU counter was reset — normally equal to `renew_date`, but can differ if CUs were reset outside the regular renewal cycle (e.g. a plan change). |
| `remaining_cus` | number | Compute Units left in the current period. Counts down from the plan's total allotment as requests are made. |
| `usage_cus` | number | Compute Units consumed so far in the current period (since `last_cu_reset_date`). `remaining_cus + usage_cus` ≈ the plan's total CU allotment for the period. |
| `total_requests_24h` | number | Total API requests made across the trailing 24 hours — a rolling window, not tied to the billing period. |
| `success_rate_24h` | number | Percentage (0–100) of requests in the trailing 24h that succeeded. |
| `total_cu_24h` | number | Compute Units spent in the trailing 24 hours — a subset of `usage_cus`, useful for spotting a recent spike vs. steady period-long consumption. |

**Example** (from [Solscan's published reference](https://pro-api.solscan.io/reference//v2-monitor-usage)):

```json
{
  "success": true,
  "data": {
    "renew_date": "2024-11-11T00:00:00.000Z",
    "end_date": "2024-12-11T00:00:00.000Z",
    "last_cu_reset_date": "2024-11-11T00:00:00.000Z",
    "remaining_cus": 999207030,
    "usage_cus": 1792970,
    "total_requests_24h": 3092,
    "success_rate_24h": 99.48253557567918,
    "total_cu_24h": 153100
  }
}
```

## Interpretation tips

- `remaining_cus` and `usage_cus` describe the **whole current billing period** (since `last_cu_reset_date` / `renew_date`), while `total_requests_24h`, `success_rate_24h`, and `total_cu_24h` describe only the **trailing 24 hours** — don't mix the two timeframes when reasoning about "how much is left" vs. "how much am I spending lately."
- To estimate days-of-runway at the current pace, divide `remaining_cus` by (`total_cu_24h`, projected daily) rather than by an average over the whole period — the 24h figure reflects *current* usage, which can differ a lot from the period-long average if usage is bursty or recently changed.
- `success_rate_24h` below 100 doesn't necessarily mean the API is unhealthy — it also counts client-side mistakes (bad params, invalid addresses) as failed requests. A low rate combined with a spike in `total_requests_24h` often means a caller is retrying a malformed request rather than the API being down.
- All three date fields (`renew_date`, `end_date`, `last_cu_reset_date`) are ISO 8601 UTC strings (e.g. `2024-11-11T00:00:00.000Z`) — parse with a standard date library rather than string-splitting.
- If `remaining_cus` reaches `0`, subsequent calls to any `solscan` command will start failing (typically `429` or a plan-limit error) until `last_cu_reset_date` rolls forward at the next renewal — check this endpoint first when other commands start failing for no apparent reason.
