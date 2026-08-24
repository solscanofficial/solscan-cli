# Program Response Fields — `popular`

Shared envelope: [program.md](program.md#common-envelope).

`solscan program popular`

No options. `data` is a **flat array** — one entry per popular DeFi platform, each covering one or more on-chain program IDs. There's no pagination — this is a fixed, curated list, not a query over all programs.

| Field | Type | Description |
|-------|------|--------------|
| `platform_id` | string | Short slug identifying the platform, e.g. `"jupiter"`. |
| `platform_name` | string | Display name, e.g. `"Jupiter Aggregator"`. |
| `program_ids` | array of string | One or more on-chain program addresses that belong to this platform (a platform can span multiple program deployments/versions). |
| `website` | string | The platform's official website URL. |
| `description` | string | Short prose description of what the platform does. Solscan's own schema mislabels this field's type as `number` — the actual value, and the one shown in their own example, is a string; treat `number` as a documentation typo. |

**Example**

```json
{
  "success": true,
  "data": [
    {
      "platform_id": "jupiter",
      "platform_name": "Jupiter Aggregator",
      "program_ids": [
        "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
        "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB"
      ],
      "website": "https://jup.ag/",
      "description": "The best swap aggregator & infrastructure for Solana - powering best price, token selection and UX for all users and devs"
    }
  ]
}
```

**Interpretation tips**

- `program_ids` is why this action exists as a companion to `program analytics`/`program list`: look up a platform here first to get every program ID it operates, then run `program analytics --address <id>` per ID if you need per-deployment stats — one platform's total activity may be split across several `program_ids` (e.g. multiple protocol versions).
- This is a small, hand-curated list (major DEXs/aggregators/lending platforms), not an exhaustive index of all Solana programs — a program not appearing here doesn't mean it's inactive, just not "popular" by Solscan's curation. Use `program list` for an activity-ranked view of all programs instead.
- No `--page`/`--page-size` — the entire list comes back in one call.
