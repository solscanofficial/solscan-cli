# Account Response Fields

Field-by-field description of the JSON each `account <action>` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../account.md](../account.md) for flags/params).

This index only holds the envelope shared by every action. Field-level docs live in three topic files, split by what the action is answering:

| File | Covers | Actions |
|------|--------|---------|
| [account-info.md](account-info.md) | What an address *is* and what it directly holds right now (no history, no pricing) | `detail`, `data-decoded`, `tokens`, `metadata`, `metadata-multi`, `funded-by` |
| [account-activity.md](account-activity.md) | Time-ordered activity for an address | `transactions`, `transactions-enhanced`, `transfers`, `transfer-total`, `transfer-export`, `defi`, `balance-change` |
| [account-holdings.md](account-holdings.md) | Aggregate, USD-priced holdings and staking | `portfolio`, `stake`, `stake-rewards`, `reward-export` |

> Only actions with a confirmed field-level source are documented in those files. If the action you need isn't listed yet (e.g. `leaderboard`), fall back to the `--no-json` output or `--help`, and treat unlabeled fields at face value rather than guessing their meaning.

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
