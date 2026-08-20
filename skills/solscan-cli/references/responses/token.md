# Token Response Fields

Field-by-field description of the JSON each `token <action>` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../token.md](../token.md) for flags/params).

This index only holds the envelope shared by every action. Field-level docs live in topic files, split by what the action is answering:

| File | Covers | Actions |
|------|--------|---------|
| [token-info.md](token-info.md) | What a token is — identity, supply, authorities, market snapshot | `meta`, `meta-multi` |
| [token-price.md](token-price.md) | Spot and historical price/market cap | `price-latest`, `price-history` |
| [token-activity.md](token-activity.md) | Time-ordered activity for a token | `transfers`, `defi`, `defi-export` |
| [token-market.md](token-market.md) | DEX pool/market listings for a token or pair | `markets` |
| [token-holders.md](token-holders.md) | Holder distribution and ranking | `holders` |
| [token-list.md](token-list.md) | Bulk token snapshots — paginated/ranked listings | `list`, `top`, `trending`, `latest` |
| [token-historical.md](token-historical.md) | Daily time series for one token — supply/holders/transfers/trade volume | `historical` |

> Only actions with a confirmed field-level source are documented in those files. If the action you need isn't listed yet, fall back to the `--no-json` output or `--help`, and treat unlabeled fields at face value rather than guessing their meaning.

## Common envelope

Every action wraps its payload the same way:

| Field | Type | Description |
|-------|------|--------------|
| `success` | boolean | `true` on `200 OK`. |
| `data` | object \| array | The actual payload, shaped per action (see the topic files above). |

On failure (`400`/`401`/`403`/`429`/`500`), `success` is `false` and `data` is replaced by:

| Field | Type | Description |
|-------|------|--------------|
| `errors.code` | number | API error code (distinct from the HTTP status). |
| `errors.message` | string | Human-readable error description, e.g. `"Validation Error: Address [...] is invalid"`. |

`defi-export` is the one exception: its `200 OK` response is a raw CSV string, not this JSON envelope — see [token-activity.md#defi-export](token-activity.md#defi-export).

Live responses also carry a third top-level sibling, `metadata` (undocumented upstream, consistently an empty object `{}` in practice) — don't confuse this envelope-level `metadata` with the `data.metadata` field that `meta`/`meta-multi` return (see [token-info.md](token-info.md)).
